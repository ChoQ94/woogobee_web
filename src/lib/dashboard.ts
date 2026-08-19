/**
 * 대시보드 집계.
 *
 * 날짜 계산은 `lib/month.ts` 에 있다 — 의존성 없는 순수 함수라 따로 검증한다.
 * 여기는 그 위에 얹히는 두 가지다:
 *
 *  1. `summarize` — DB 에서 읽은 행들을 요약으로 접는다. 순수 함수다
 *  2. `getMonthSummary` — 유일한 DB 접근. 첫 줄에서 세션을 확인하고
 *     쿼리 where 에 `userId` 를 건다 (PROJECT.md §7.1)
 *
 * 계산 규칙은 PROJECT.md §2 를 그대로 따른다. 특히 **연납을 12로 나누지 않는다** —
 * 사용자가 "월 평균 부담액"을 명시적으로 거절했다. 그 달만 총액이 튀는 게 정상이다.
 */
import { auth } from "@/auth";
import { type CategoryColor, toCategoryColor } from "@/lib/category-colors";
import {
  type Cycle,
  type MonthKey,
  isDueInMonth,
  resolvePaymentDay,
  currentMonth,
} from "@/lib/month";
import { prisma } from "@/lib/prisma";

// 화면이 dashboard.ts 하나만 import 해도 되도록 달 타입을 다시 내보낸다.
export type { MonthKey, Cycle } from "@/lib/month";
export { currentMonth, lastDayOfMonth, resolvePaymentDay, isDueInMonth } from "@/lib/month";

/** 미분류 묶음의 표시 이름. 카테고리가 없는 지출도 어딘가에는 속해야 한다. */
export const UNCATEGORIZED_NAME = "미분류";
/** 미분류 색. 팔레트 밖 값이 들어와도 `toCategoryColor` 가 여기로 떨어뜨린다. */
export const UNCATEGORIZED_COLOR: CategoryColor = "slate";

/** Prisma 조회 결과의 모양. `summarize` 에 넘기는 입력이자 테스트용 픽스처의 타입이다. */
export type MonthlyItemSource = {
  id: string;
  name: string;
  amount: number;
  cycle: Cycle;
  paymentDay: number;
  paymentMonth: number | null;
  /** 해지 시점. `null` 이 아니면 더 이상 나가지 않으므로 집계에서 뺀다. */
  endedAt: Date | null;
  category: { id: string; name: string; color: string } | null;
};

export type MonthlyItem = {
  id: string;
  name: string;
  amount: number;
  cycle: Cycle;
  paymentDay: number;
  /** 보정 후 실제 일자. paymentDay=31 이고 2월이면 28 (윤년 29) */
  resolvedDay: number;
  category: { id: string; name: string; color: string } | null;
};

export type CategoryShare = {
  categoryId: string | null;
  name: string;
  color: CategoryColor;
  amount: number;
  /** 0~1. total 이 0 이면 0. 반올림하지 않는다 — 표시 반올림은 화면 몫이다. */
  ratio: number;
};

export type MonthSummary = {
  month: MonthKey;
  /** 이번 달 실제 결제 합계. 연납은 결제되는 달에 전액이 잡힌다 */
  total: number;
  /** resolvedDay 오름차순, 같으면 name 오름차순 */
  items: MonthlyItem[];
  /** amount 내림차순. 미분류는 금액과 무관하게 항상 맨 뒤 */
  shares: CategoryShare[];
};

/**
 * DB 에서 읽은 행들을 요약으로 접는다. 인증·DB 없음.
 *
 * `endedAt` 필터를 쿼리와 여기 양쪽에 두는 건 중복이 아니라 이중 방어다.
 * 이 함수만 따로 불러 검증할 때도 "해지한 건 안 나간다"는 규칙이 유지돼야 한다.
 */
export function summarize(rows: MonthlyItemSource[], month: MonthKey): MonthSummary {
  const items: MonthlyItem[] = [];

  for (const row of rows) {
    if (row.endedAt !== null) continue;
    if (!isDueInMonth(row.cycle, row.paymentMonth, month)) continue;

    items.push({
      id: row.id,
      name: row.name,
      amount: row.amount,
      cycle: row.cycle,
      paymentDay: row.paymentDay,
      resolvedDay: resolvePaymentDay(month.year, month.month, row.paymentDay),
      category: row.category,
    });
  }

  // 돈이 빠져나가는 순서로 읽히게 한다. 같은 날이면 이름순이라 렌더가 안정적이다.
  items.sort((a, b) => a.resolvedDay - b.resolvedDay || a.name.localeCompare(b.name, "ko"));

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  // 카테고리별로 접는다. 키가 null 인 묶음이 미분류다.
  const buckets = new Map<string | null, { name: string; color: CategoryColor; amount: number }>();

  for (const item of items) {
    const key = item.category?.id ?? null;
    const existing = buckets.get(key);
    if (existing) {
      existing.amount += item.amount;
      continue;
    }
    buckets.set(key, {
      name: item.category?.name ?? UNCATEGORIZED_NAME,
      // DB 의 color 는 그냥 String 이라 팔레트 밖 값이 들어올 수 있다.
      color: item.category ? toCategoryColor(item.category.color) : UNCATEGORIZED_COLOR,
      amount: item.amount,
    });
  }

  const shares: CategoryShare[] = [];
  for (const [categoryId, bucket] of buckets) {
    shares.push({
      categoryId,
      name: bucket.name,
      color: bucket.color,
      // 0 으로 나누지 않는다. 항목이 전부 0원이어도 total 은 0 이 될 수 있다.
      ratio: total === 0 ? 0 : bucket.amount / total,
      amount: bucket.amount,
    });
  }

  // 미분류는 금액이 아무리 커도 맨 뒤. 실제 카테고리들 사이에 끼면 읽기 혼란스럽다.
  shares.sort((a, b) => {
    if (a.categoryId === null) return b.categoryId === null ? 0 : 1;
    if (b.categoryId === null) return -1;
    return b.amount - a.amount || a.name.localeCompare(b.name, "ko");
  });

  return { month, total, items, shares };
}

/**
 * 이 달의 요약. 대시보드가 부르는 유일한 진입점.
 *
 * `expenses.ts` 와 같은 규칙을 지킨다 — 첫 줄에서 세션을 확인하고,
 * 단수형 API 대신 `findMany` 의 where 에 `userId` 를 박아 넣는다.
 * 이 확인이 유일한 방어선이다 (PROJECT.md §7.1).
 */
async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getMonthSummary(month?: MonthKey): Promise<MonthSummary> {
  const userId = await requireUserId();
  const target = month ?? currentMonth();

  const rows = await prisma.expense.findMany({
    where: { userId, endedAt: null },
    select: {
      id: true,
      name: true,
      amount: true,
      cycle: true,
      paymentDay: true,
      paymentMonth: true,
      endedAt: true,
      category: { select: { id: true, name: true, color: true } },
    },
  });

  return summarize(rows, target);
}
