/**
 * 고정지출 데이터 접근의 유일한 통로.
 *
 * Supabase RLS 를 쓰지 않기로 했으므로 "이 데이터가 정말 이 사람 것인가"를
 * 막아주는 건 이 파일의 코드뿐이다. 그래서 지출 관련 Prisma 호출을 여기 한 곳에 모은다.
 * 화면이나 서버 액션이 `prisma.expense` 를 직접 부르기 시작하면
 * 언젠가 한 군데에서 `userId` 필터를 빠뜨리고, 그 한 군데가 곧 사고다.
 *
 * 규칙 두 가지를 예외 없이 지킨다.
 *  1. 모든 공개 함수는 첫 줄에서 `requireUserId()` 로 세션을 확인한다.
 *  2. `delete`/`update`/`findUnique` 같은 단수형 API 를 쓰지 않는다.
 *     이들은 where 에 고유키만 받아서 `userId` 를 함께 걸 수 없다.
 *     대신 `deleteMany`/`updateMany`/`findFirst` 를 써서 소유권 조건을 쿼리에 박아 넣는다.
 */
import type { Expense } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ExpenseInput = {
  name: string;
  /** 원 단위 정수 */
  amount: number;
  cycle: "MONTHLY" | "YEARLY";
  /** 1~31. 해당 월에 없는 날이면 화면에서 그 달 마지막 날로 당긴다 */
  paymentDay: number;
  /** YEARLY 일 때만 1~12, MONTHLY 면 반드시 null */
  paymentMonth: number | null;
  categoryId: string | null;
  memo: string | null;
};

export type FieldErrors = Partial<Record<keyof ExpenseInput, string>>;

/**
 * 목록·상세에서 함께 쓰는 모양.
 *
 * 카테고리는 뱃지를 그리는 데 필요한 세 필드만 가져온다.
 * 화면이 이 타입을 그대로 import 할 수 있도록 Prisma 생성 타입 위에 명시적으로 얹었다.
 */
export type ExpenseWithCategory = Expense & {
  category: { id: string; name: string; color: string } | null;
};

const CATEGORY_SELECT = { select: { id: true, name: true, color: true } } as const;

const AMOUNT_LIMIT = 1_000_000_000;

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

/**
 * 입력값 검증. 세션을 보지 않는 순수 함수라서 서버 액션이 부담 없이 먼저 호출할 수 있다.
 * 필드별 메시지를 돌려주는 이유는, 폼에서 잘못된 칸 옆에 바로 붙여 보여주기 위해서다.
 */
export function validateExpenseInput(input: ExpenseInput): FieldErrors {
  const errors: FieldErrors = {};

  const name = input.name?.trim() ?? "";
  if (name.length < 1) {
    errors.name = "이름을 입력해 주세요.";
  } else if (name.length > 50) {
    errors.name = "이름은 50자 이내로 입력해 주세요.";
  }

  // 폼에서 빈 칸이 넘어오면 NaN 이 된다. Number.isInteger 가 NaN 을 함께 걸러준다.
  if (!Number.isInteger(input.amount)) {
    errors.amount = "금액을 숫자로 입력해 주세요.";
  } else if (input.amount < 0) {
    errors.amount = "금액은 0원 이상이어야 합니다.";
  } else if (input.amount >= AMOUNT_LIMIT) {
    errors.amount = "금액은 10억원 미만으로 입력해 주세요.";
  }

  if (input.cycle !== "MONTHLY" && input.cycle !== "YEARLY") {
    errors.cycle = "결제 주기를 선택해 주세요.";
  }

  if (!Number.isInteger(input.paymentDay) || input.paymentDay < 1 || input.paymentDay > 31) {
    errors.paymentDay = "결제일은 1~31 사이로 입력해 주세요.";
  }

  if (input.cycle === "YEARLY") {
    if (!Number.isInteger(input.paymentMonth) || (input.paymentMonth ?? 0) < 1 || (input.paymentMonth ?? 0) > 12) {
      errors.paymentMonth = "연납은 결제 월을 1~12 사이로 선택해야 합니다.";
    }
  } else if (input.paymentMonth !== null) {
    // 월납인데 월이 남아 있으면 나중에 달력이 엉뚱한 달에만 항목을 그린다.
    errors.paymentMonth = "월납에는 결제 월을 지정할 수 없습니다.";
  }

  if (input.memo !== null && input.memo !== undefined && input.memo.trim().length > 200) {
    errors.memo = "메모는 200자 이내로 입력해 주세요.";
  }

  return errors;
}

/**
 * 남의 카테고리 id 를 붙여 저장하는 걸 막는다.
 *
 * 없거나 남의 것이면 예외를 던지는 대신 조용히 미분류(null)로 떨어뜨린다.
 * 정상 사용자가 이 경로에 닿는 경우는 "다른 탭에서 방금 지운 카테고리"뿐인데,
 * 그때 저장을 통째로 실패시키면 입력한 내용까지 날아간다. 미분류로 남기면 나중에 고치면 된다.
 */
async function resolveCategoryId(userId: string, categoryId: string | null): Promise<string | null> {
  if (!categoryId) return null;
  const owned = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true },
  });
  return owned?.id ?? null;
}

/** 저장 직전 정규화. 앞뒤 공백과 빈 메모를 여기서 한 번에 정리한다. */
function normalize(input: ExpenseInput) {
  const memo = input.memo?.trim() ?? "";
  return {
    name: input.name.trim(),
    amount: input.amount,
    cycle: input.cycle,
    paymentDay: input.paymentDay,
    // 월납의 paymentMonth 는 검증에서 null 임이 보장된다.
    paymentMonth: input.cycle === "YEARLY" ? input.paymentMonth : null,
    memo: memo.length > 0 ? memo : null,
  };
}

/**
 * 서버 액션을 우회해 lib 이 직접 호출될 가능성에 대비한 두 번째 방어선.
 * 필드별 메시지는 이미 액션이 처리하므로 여기서는 첫 메시지만 얹어 던진다.
 */
function assertValid(input: ExpenseInput): void {
  const errors = validateExpenseInput(input);
  const first = Object.values(errors)[0];
  if (first) throw new Error(first);
}

/**
 * 지출 목록.
 *
 * 기본은 진행 중인 것만 보여준다. 해지한 항목은 지우지 않고 `endedAt` 으로만 숨기므로
 * 과거를 돌아볼 화면에서는 `includeEnded: true` 로 전부 가져온다.
 * 정렬은 결제일 오름차순 — 목록이 "이번 달에 돈이 빠져나가는 순서"로 읽힌다.
 */
export async function listExpenses(options?: { includeEnded?: boolean }): Promise<ExpenseWithCategory[]> {
  const userId = await requireUserId();

  return prisma.expense.findMany({
    where: { userId, ...(options?.includeEnded ? {} : { endedAt: null }) },
    include: { category: CATEGORY_SELECT },
    orderBy: [{ paymentDay: "asc" }, { name: "asc" }],
  });
}

/** 단건 조회. `findUnique` 가 아니라 `findFirst` 인 이유는 where 에 userId 를 함께 걸기 위해서다. */
export async function getExpense(id: string): Promise<ExpenseWithCategory | null> {
  const userId = await requireUserId();

  return prisma.expense.findFirst({
    where: { id, userId },
    include: { category: CATEGORY_SELECT },
  });
}

export async function createExpense(input: ExpenseInput): Promise<void> {
  const userId = await requireUserId();
  assertValid(input);

  const categoryId = await resolveCategoryId(userId, input.categoryId);

  await prisma.expense.create({
    data: { ...normalize(input), userId, categoryId },
  });
}

export async function updateExpense(id: string, input: ExpenseInput): Promise<void> {
  const userId = await requireUserId();
  assertValid(input);

  const categoryId = await resolveCategoryId(userId, input.categoryId);

  await prisma.expense.updateMany({
    where: { id, userId },
    data: { ...normalize(input), categoryId },
  });
}

/** 해지. 기록을 남겨야 "작년 3월엔 얼마 나갔지"를 되돌아볼 수 있으므로 삭제하지 않는다. */
export async function endExpense(id: string): Promise<void> {
  const userId = await requireUserId();

  await prisma.expense.updateMany({
    where: { id, userId },
    data: { endedAt: new Date() },
  });
}

/** 해지 취소. 다시 진행 중으로 되돌린다. */
export async function resumeExpense(id: string): Promise<void> {
  const userId = await requireUserId();

  await prisma.expense.updateMany({
    where: { id, userId },
    data: { endedAt: null },
  });
}

/** 진짜 삭제. 잘못 등록한 항목을 지우는 용도이고, 해지와는 다르다. */
export async function deleteExpense(id: string): Promise<void> {
  const userId = await requireUserId();

  await prisma.expense.deleteMany({ where: { id, userId } });
}
