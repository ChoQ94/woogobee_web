import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  CATEGORY_BADGE_CLASS,
  CATEGORY_DOT_CLASS,
  toCategoryColor,
} from "@/lib/category-colors";
import { getMonthSummary, type MonthlyItem } from "@/lib/dashboard";
import { formatAmount } from "@/lib/format";
import {
  type CalendarCell,
  type MonthKey,
  addMonths,
  buildMonthGrid,
  todayInKst,
} from "@/lib/month";
import {
  BADGE,
  BADGE_YEARLY,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  EMPTY_STATE,
} from "@/lib/ui-classes";

/* ---------------------------------------------------------------------------
 * 달 이동은 URL 쿼리로 한다 — `/calendar?y=2026&m=9`.
 *
 * 클라이언트 상태를 쓰지 않는 이유는 세 가지다. 서버 컴포넌트가 그대로 그 달을
 * 조회할 수 있고, 링크를 공유·북마크할 수 있고, 뒤로가기가 브라우저 기본 동작으로
 * 자연스럽게 동작한다.
 * ------------------------------------------------------------------------- */

/** 상식적인 연도 범위. 밖의 값은 사용자가 친 게 아니라 깨진 링크로 본다. */
const MIN_YEAR = 1970;
const MAX_YEAR = 2999;

/** 달력 셀에 이름까지 보여주는 최대 개수 (design.md `{components.calendar-cell}`). */
const MAX_NAMES_IN_CELL = 3;
/** 모바일 셀에 찍는 최대 점 개수. 넘치면 `…` 하나로 접는다. */
const MAX_DOTS_IN_CELL = 3;

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 쿼리 한 칸을 숫자로 좁힌다.
 *
 * `searchParams` 값은 `string | string[] | undefined` 다. 배열(`?y=1&y=2`)이나
 * 빈 문자열(`?y=`)을 `Number()` 에 그대로 넣으면 각각 0 이나 NaN 이 조용히 나오므로
 * 문자열인지부터 확인하고, 정수와 범위를 함께 본다.
 *
 * 범위를 벗어나면 `null` 을 돌려주고 부르는 쪽이 이번 달 값으로 떨어뜨린다.
 * **깨진 쿼리로 화면이 죽으면 안 된다** — `?y=abc&m=99` 는 에러가 아니라
 * 이번 달 달력이어야 한다.
 */
function parseQueryNumber(
  raw: string | string[] | undefined,
  min: number,
  max: number,
): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isInteger(value)) return null;
  if (value < min || value > max) return null;
  return value;
}

/**
 * 연·월을 따로 검증한다. 한쪽만 깨져 있어도 나머지 한쪽은 살린다 —
 * `?y=2027` 만 온 경우 2027년 이번 달, `?m=9` 만 온 경우 올해 9월이다.
 */
function resolveMonth(
  raw: { [key: string]: string | string[] | undefined },
  fallback: MonthKey,
): MonthKey {
  return {
    year: parseQueryNumber(raw.y, MIN_YEAR, MAX_YEAR) ?? fallback.year,
    month: parseQueryNumber(raw.m, 1, 12) ?? fallback.month,
  };
}

function calendarHref(month: MonthKey): string {
  return "/calendar?y=" + month.year + "&m=" + month.month;
}

/** 카테고리 점 하나. 6px 원 = `size-1.5` (design.md `{components.calendar-dot}`). */
function CategoryDot({ color }: { color: string | null | undefined }) {
  return (
    <span
      aria-hidden="true"
      className={
        // 클래스명을 조립하지 않는다. 조립하면 Tailwind 가 스캔하지 못해
        // 오류도 경고도 없이 색만 빠진다 (PROJECT.md §7.9).
        CATEGORY_DOT_CLASS[toCategoryColor(color)] +
        " size-1.5 shrink-0 rounded-full"
      }
    />
  );
}

/**
 * 달력 한 칸.
 *
 * 반응형이 이 화면의 진짜 난제다. 320px 폭에서 7열이면 한 칸이 약 41px 이라
 * 항목 이름이 들어갈 자리가 없다. 그래서 폭에 따라 **정보 밀도만** 낮춘다.
 *
 *  - `sm` 미만: 날짜 숫자 + 카테고리 점만. 칸은 정사각형에 가깝게 유지한다
 *  - `sm` 이상: 이름 최대 3개 + `+N건` + 그날 합계
 *
 * 격자를 가로 스크롤로 도망치지 않는다 — 7 열이 늘 화면 안에 들어와야
 * "언제 빠져나가는가"를 한눈에 본다는 목적이 유지된다 (design.md "반응형").
 *
 * 이웃 달 칸은 항목을 그리지 않는다. 그 달을 조회하지 않았으므로 "없다"가 아니라
 * "모른다"이고, 빈 칸으로 두는 게 정직하다.
 */
function DayCell({
  cell,
  items,
  isToday,
}: {
  cell: CalendarCell;
  items: MonthlyItem[];
  isToday: boolean;
}) {
  const dayTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const named = items.slice(0, MAX_NAMES_IN_CELL);
  const hiddenCount = items.length - named.length;
  const dots = items.slice(0, MAX_DOTS_IN_CELL);

  // 오늘은 primary 1px 테두리 + primary-tint 채움.
  // 채움에 primary(#c38ed5)를 쓰면 그 위 합계가 2.4:1 로 무너지지만,
  // primary-tint(#f9edfd)는 날짜 숫자가 15.8:1 로 남는다
  // (design.md `{components.calendar-cell-today}`).
  const border = isToday
    ? "border-primary relative z-10"
    : "border-hairline";
  const surface = !cell.inMonth
    ? "bg-surface-soft text-subtle"
    : isToday
      ? "bg-primary-tint text-ink"
      : "bg-surface-card text-ink";

  return (
    <div
      className={
        // -mt-px -ml-px 로 이웃 칸과 테두리를 겹쳐 2px 로 두꺼워지는 걸 막는다.
        // 격자 바깥으로 삐져나간 1px 는 감싸는 쪽의 overflow-hidden 이 자른다.
        "-mt-px -ml-px flex aspect-square min-h-11 flex-col border p-1 sm:aspect-auto sm:min-h-28 sm:p-2 " +
        border +
        " " +
        surface
      }
    >
      {/* 날짜 숫자는 좌상단, `{typography.caption}`. 오늘만 caption-strong. */}
      <span
        className={
          isToday
            ? "text-caption-strong tabular-nums"
            : "text-caption tabular-nums"
        }
      >
        {cell.day}
      </span>

      {/* 모바일: 점만. 4개 이상이면 점 3개 + `…` 로 접는다. */}
      {items.length > 0 ? (
        <div className="mt-0.5 flex items-center gap-0.5 sm:hidden">
          {dots.map((item) => (
            <CategoryDot key={item.id} color={item.category?.color} />
          ))}
          {items.length > dots.length ? (
            <span className="text-caption text-subtle" aria-hidden="true">
              …
            </span>
          ) : null}
        </div>
      ) : null}

      {/* sm 이상: 카테고리 점 + 이름, 최대 3개. */}
      {items.length > 0 ? (
        <ul className="mt-1 hidden min-w-0 flex-col gap-0.5 sm:flex">
          {named.map((item) => (
            <li key={item.id} className="flex min-w-0 items-center gap-1">
              <CategoryDot color={item.category?.color} />
              <span className="min-w-0 truncate text-caption">{item.name}</span>
            </li>
          ))}
          {hiddenCount > 0 ? (
            // design.md `{components.calendar-overflow-label}`
            <li className="text-caption text-subtle">{"+" + hiddenCount + "건"}</li>
          ) : null}
        </ul>
      ) : null}

      {/* sm 이상: 칸 하단에 그날 합계. `{components.calendar-day-total}` */}
      {/* 오늘 칸은 primary-tint 위라 muted 가 4.21:1 로 AA 에 못 미친다.
          그 칸에서만 body(#334155, 9.15:1)로 올린다 (design.md).
          `text-body` 는 타이포 토큰이 아니라 **색 토큰**으로 해석된다 —
          `body` 라는 이름이 색과 타이포 양쪽에 있고 색 네임스페이스가 이긴다.
          여기서는 색을 원하는 것이므로 의도한 동작이다. */}
      {items.length > 0 ? (
        <span
          className={
            "mt-auto hidden pt-1 text-right text-amount-sm tabular-nums sm:block " +
            (isToday ? "text-body" : "text-muted")
          }
        >
          {formatAmount(dayTotal)}
        </span>
      ) : null}
    </div>
  );
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // proxy 의 쿠키 검사는 낙관적일 뿐이므로 여기서 다시 확인한다.
  // 이 한 줄이 실제 방어선이다 (PROJECT.md 함정 7.1).
  const session = await auth();
  if (!session?.user) redirect("/");

  // Next 16 에서 `searchParams` 는 Promise 다.
  const query = await searchParams;
  const today = todayInKst();
  const thisMonth: MonthKey = { year: today.year, month: today.month };
  const month = resolveMonth(query, thisMonth);

  // 달력은 DB 코드를 새로 만들지 않는다. `getMonthSummary` 가 임의의 달을 받고,
  // 각 항목에 보정 완료된 `resolvedDay` 가 이미 들어 있다.
  const { total, items } = await getMonthSummary(month);

  // 날짜별로 접는다. `items` 가 이미 resolvedDay 오름차순이라 각 칸 안에서도
  // 정렬이 유지된다.
  const itemsByDay = new Map<number, MonthlyItem[]>();
  for (const item of items) {
    const bucket = itemsByDay.get(item.resolvedDay);
    if (bucket) bucket.push(item);
    else itemsByDay.set(item.resolvedDay, [item]);
  }

  const cells = buildMonthGrid(month);
  const prev = addMonths(month, -1);
  const next = addMonths(month, 1);
  const isThisMonth =
    month.year === thisMonth.year && month.month === thisMonth.month;
  const monthLabel = month.year + "년 " + month.month + "월";
  const yearlyCount = items.filter((item) => item.cycle === "YEARLY").length;

  return (
    <main className="bg-canvas text-ink">
      <div className="mx-auto max-w-page px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-title">달력</h1>
          <Link href="/expenses/new" className={BUTTON_PRIMARY}>
            지출 추가
          </Link>
        </div>

        {/* 머리말 — 달을 넘길 때마다 연납 때문에 총액이 크게 튄다. 그 튐이
            이 화면의 핵심 정보라서 달 이름 옆에 총액을 같이 둔다. */}
        <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-card px-5 py-6">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href={calendarHref(prev)}
                aria-label={prev.year + "년 " + prev.month + "월 보기"}
                className={BUTTON_SECONDARY}
              >
                ←
              </Link>
              <h2 className="text-title">{monthLabel}</h2>
              <Link
                href={calendarHref(next)}
                aria-label={next.year + "년 " + next.month + "월 보기"}
                className={BUTTON_SECONDARY}
              >
                →
              </Link>
              {isThisMonth ? null : (
                <Link href="/calendar" className="text-caption text-primary-ink">
                  이번 달로
                </Link>
              )}
            </div>
            <p className="mt-2 text-caption text-muted">
              {"결제 예정 " + items.length + "건"}
              {yearlyCount > 0 ? " · 연납 " + yearlyCount + "건 포함" : null}
            </p>
          </div>
          <p className="text-amount-lg tabular-nums">{formatAmount(total)}</p>
        </section>

        {/* design.md `{components.calendar-grid}` — 흰 면 + hairline 1px + 12px.
            각 칸의 음수 마진이 바깥으로 1px 삐져나오므로 overflow-hidden 으로 자른다. */}
        <div className="mt-6 overflow-hidden rounded-lg border border-hairline bg-surface-card">
          <div className="grid grid-cols-7">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="border-b border-hairline py-2 text-center text-caption text-muted"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((cell) => {
              const isToday =
                cell.inMonth &&
                cell.year === today.year &&
                cell.month === today.month &&
                cell.day === today.day;

              return (
                <DayCell
                  key={cell.year + "-" + cell.month + "-" + cell.day}
                  cell={cell}
                  // 이웃 달은 조회하지 않았으므로 항목을 그리지 않는다.
                  items={cell.inMonth ? (itemsByDay.get(cell.day) ?? []) : []}
                  isToday={isToday}
                />
              );
            })}
          </div>
        </div>

        {/* 격자 아래 목록이 모든 폭에서 완전한 정보를 준다. 모바일에서는 칸이 좁아
            이름이 아예 안 보이므로 이쪽이 실질적인 본문이다. */}
        {items.length === 0 ? (
          <div className={EMPTY_STATE + " mt-6"}>
            <p className="text-muted">이 달은 결제 예정이 없습니다.</p>
            <Link href="/expenses/new" className={BUTTON_PRIMARY}>
              지출 추가
            </Link>
          </div>
        ) : (
          <section className={CARD + " mt-6"}>
            <h2 className="mb-3 text-section">{monthLabel + " 결제 예정"}</h2>
            <ul className="flex flex-col gap-3">
              {items.map((item) => {
                // 카테고리가 없으면 "미분류" + slate.
                const badgeClass =
                  CATEGORY_BADGE_CLASS[toCategoryColor(item.category?.color)];
                // 31일인데 그 달이 30일까지인 경우 등. 왜 날짜가 다른지 알려준다.
                const isShifted = item.paymentDay !== item.resolvedDay;

                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-baseline gap-3">
                      <span className="shrink-0 text-caption tabular-nums text-muted">
                        {month.month + "월 " + item.resolvedDay + "일"}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={"/expenses/" + item.id + "/edit"}
                            className="text-body-strong"
                          >
                            {item.name}
                          </Link>
                          <span className={badgeClass + " " + BADGE}>
                            {item.category?.name ?? "미분류"}
                          </span>
                          {item.cycle === "YEARLY" ? (
                            <span className={BADGE_YEARLY}>연납</span>
                          ) : null}
                        </div>
                        {isShifted ? (
                          <p className="mt-1 text-caption text-muted">
                            {item.paymentDay +
                              "일 → " +
                              item.resolvedDay +
                              "일 (이 달에 없는 날짜라 말일로 당김)"}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <span className="text-amount tabular-nums">
                      {formatAmount(item.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
