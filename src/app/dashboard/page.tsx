import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import {
  CATEGORY_BADGE_CLASS,
  CATEGORY_DOT_CLASS,
  CATEGORY_STROKE_CLASS,
  toCategoryColor,
} from "@/lib/category-colors";
import { getMonthSummary, type CategoryShare } from "@/lib/dashboard";
import { formatAmount } from "@/lib/format";
import {
  BADGE,
  BADGE_YEARLY,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  EMPTY_STATE,
} from "@/lib/ui-classes";

/* ---------------------------------------------------------------------------
 * 도넛 치수
 *
 * 라이브러리를 쓰지 않고 `<circle>` 하나의 stroke 로 조각을 그린다.
 * 조각 하나 = 원 둘레만큼 긴 점선에서 "칠하는 구간"의 길이와 시작 위치를 지정한 것이다.
 *
 * 지름 260px 인 이유는 가운데 총액 때문이다. 구멍 지름은
 * (반지름 104 − 선 두께 절반 14) × 2 = 180px 이고, `{typography.amount-lg}` 28px 로
 * 찍은 `12,340,000원` 이 여기에 들어간다. 더 작게 잡으면 총액이 링을 뚫고 나온다.
 * ------------------------------------------------------------------------- */
const DONUT_SIZE = 260;
const DONUT_CENTER = DONUT_SIZE / 2; // 130
const DONUT_RADIUS = 104;
const DONUT_STROKE_WIDTH = 28;
/** 원 둘레. 조각 길이는 전부 이 값에 `ratio` 를 곱해서 낸다. */
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

/** 카테고리가 없는 조각의 key. `categoryId` 가 null 이라 문자열 하나를 대신 쓴다. */
const UNCATEGORIZED_KEY = "uncategorized";

/** 퍼센트 표기. 반올림 때문에 합이 100 이 안 될 수 있고, 그건 그대로 둔다. */
function toPercent(ratio: number): number {
  return Math.round(ratio * 100);
}

/**
 * 카테고리별 비중 도넛.
 *
 * 조각은 같은 원을 여러 번 겹쳐 그리되 각각 다른 구간만 칠하는 방식이다.
 *
 *   strokeDasharray  = `${ratio × 둘레} ${둘레}`
 *       → 앞의 길이만 칠하고, 뒤의 빈 구간이 둘레만큼 길어서 한 바퀴에 한 조각만 나온다
 *   strokeDashoffset = −(앞 조각들의 ratio 합) × 둘레
 *       → 음수 오프셋이 칠하는 구간을 그만큼 앞으로 밀어 이전 조각 뒤에 이어 붙인다
 *   transform        = rotate(-90)
 *       → SVG 원은 3시 방향에서 시작한다. 12시에서 시작해 시계방향으로 돌게 돌린다
 *
 * 경계에서:
 * - 조각이 하나뿐(ratio 1)이면 dash 길이 = 둘레, 오프셋 0 → 이음매 없는 완전한 링
 * - ratio 0 인 카테고리는 dash 길이 0 이라 아무것도 안 그려지므로 아예 거른다
 * - 조각 길이를 반올림한 퍼센트가 아니라 `ratio` 원값으로 재기 때문에
 *   조각 합은 항상 정확히 둘레와 같다 → 링에 빈틈이 생기지 않는다
 */
function CategoryDonut({
  shares,
  total,
}: {
  shares: CategoryShare[];
  total: number;
}) {
  // 각 조각의 시작 위치 = 앞 조각들의 ratio 합.
  // 렌더 중에 변수를 다시 대입하지 않으려고(react-hooks/immutability) 누적 변수 대신
  // 앞부분을 그때그때 더한다. 카테고리는 최대 8개 + 미분류라 비용은 없는 것과 같다.
  const visible = shares.filter((share) => share.ratio > 0);
  const slices = visible.map((share, index) => ({
    share,
    start: visible
      .slice(0, index)
      .reduce((sum, previous) => sum + previous.ratio, 0),
  }));

  // 스크린리더는 SVG 도형을 읽지 못한다. 차트가 말하는 내용을 문장으로 따로 적어준다.
  const chartLabel =
    "카테고리별 비중. 총 " +
    formatAmount(total) +
    ". " +
    slices
      .map(
        ({ share }) =>
          share.name +
          " " +
          formatAmount(share.amount) +
          ", " +
          toPercent(share.ratio) +
          "퍼센트",
      )
      .join(". ");

  return (
    <div>
      {/* 260px 를 고정폭이 아니라 상한으로 둔다. 좁은 화면(320px)에서 카드 안여백까지
          빼고 나면 260px 가 들어가지 않아 도넛이 카드를 뚫고 나간다.
          `viewBox` 로 그렸으므로 폭만 줄면 그림은 그대로 따라 줄어든다. */}
      <div className="relative mx-auto flex aspect-square w-full max-w-65 items-center justify-center">
        <svg
          viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
          role="img"
          aria-label={chartLabel}
          className="h-full w-full"
        >
          {/* 바탕 링. 조각 합이 둘레와 같으니 보일 일은 없지만,
              데이터가 비정상일 때 링이 끊겨 보이는 대신 회색으로 메워지게 한다. */}
          <circle
            cx={DONUT_CENTER}
            cy={DONUT_CENTER}
            r={DONUT_RADIUS}
            fill="none"
            strokeWidth={DONUT_STROKE_WIDTH}
            className="stroke-hairline"
          />
          {slices.map(({ share, start }) => (
            <circle
              key={share.categoryId ?? UNCATEGORIZED_KEY}
              cx={DONUT_CENTER}
              cy={DONUT_CENTER}
              r={DONUT_RADIUS}
              fill="none"
              strokeWidth={DONUT_STROKE_WIDTH}
              // 클래스명을 조립하지 않는다. 조립하면 Tailwind 가 스캔하지 못해
              // 오류도 경고도 없이 색만 빠진다 (PROJECT.md §7.9).
              className={CATEGORY_STROKE_CLASS[share.color]}
              strokeDasharray={`${share.ratio * DONUT_CIRCUMFERENCE} ${DONUT_CIRCUMFERENCE}`}
              strokeDashoffset={-start * DONUT_CIRCUMFERENCE}
              transform={`rotate(-90 ${DONUT_CENTER} ${DONUT_CENTER})`}
            />
          ))}
        </svg>

        {/* 총액은 SVG <text> 대신 CSS 로 겹친다 — 그래야 폰트 토큰을 그대로 쓴다. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute flex flex-col items-center"
        >
          <span className="text-caption text-muted">합계</span>
          <span className="text-amount-lg tabular-nums">
            {formatAmount(total)}
          </span>
        </div>
      </div>

      {/* 범례 — 점 색은 도넛 조각과 같은 `-dot` 토큰이라 눈으로 이어 읽힌다. */}
      <ul className="mt-5 flex flex-col gap-3">
        {shares.map((share) => (
          <li
            key={share.categoryId ?? UNCATEGORIZED_KEY}
            className="flex items-center gap-3"
          >
            <span
              aria-hidden="true"
              className={
                CATEGORY_DOT_CLASS[share.color] + " size-1.5 shrink-0 rounded-full"
              }
            />
            <span className="min-w-0 flex-1 truncate">{share.name}</span>
            <span className="text-amount tabular-nums">
              {formatAmount(share.amount)}
            </span>
            <span className="w-10 text-right text-caption tabular-nums text-muted">
              {toPercent(share.ratio)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function DashboardPage() {
  // proxy 의 쿠키 검사는 낙관적일 뿐이므로 여기서 다시 확인한다.
  // 이 한 줄이 실제 방어선이다 (PROJECT.md 함정 7.1).
  const session = await auth();
  if (!session?.user) redirect("/");

  const summary = await getMonthSummary();
  const { month, total, items, shares } = summary;

  const monthLabel = month.year + "년 " + month.month + "월";
  const yearlyCount = items.filter((item) => item.cycle === "YEARLY").length;
  // 0원짜리 도넛은 그리지 않는다.
  const isEmpty = total === 0 && items.length === 0;

  return (
    <main className="min-h-dvh bg-canvas text-ink">
      <div className="mx-auto max-w-page px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-title">대시보드</h1>
          <div className="flex items-center gap-3">
            <Link href="/expenses" className={BUTTON_SECONDARY}>
              고정지출 관리
            </Link>
            <Link href="/expenses/new" className={BUTTON_PRIMARY}>
              지출 추가
            </Link>
          </div>
        </div>

        {/* design.md {component.total-summary} — 패딩 24px 20px.
            이번 달 "실제 결제액" 하나만 크게 둔다. 월 평균 부담액 같은 파생 숫자는
            넣지 않는다 (PROJECT.md §2). */}
        <section className="mt-6 rounded-lg border border-hairline bg-surface-card px-5 py-6">
          <p className="text-caption text-muted">{monthLabel}</p>
          <p className="mt-2 text-display tabular-nums">{formatAmount(total)}</p>
          <p className="mt-2 text-caption text-muted">
            {"이번 달 결제 예정 " + items.length + "건"}
            {/* 연납이 낀 달은 총액이 튄다. 왜 튀는지를 여기서 알려준다 (PROJECT.md §2). */}
            {yearlyCount > 0 ? " · 연납 " + yearlyCount + "건 포함" : null}
          </p>
        </section>

        {isEmpty ? (
          <div className={EMPTY_STATE + " mt-6"}>
            <p className="text-muted">이번 달 결제 예정이 없습니다.</p>
            <Link href="/expenses/new" className={BUTTON_PRIMARY}>
              지출 추가
            </Link>
          </div>
        ) : (
          // design.md "레이아웃 > 컨테이너": 총액 카드가 폭 전체, 그 아래 비중과 예정 목록이 2열.
          // 모바일(<640px)에서는 세로로 쌓는다.
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {/* design.md {component.donut-chart} */}
            <section className={CARD}>
              <h2 className="mb-3 text-section">카테고리별 비중</h2>
              {shares.length > 0 ? (
                <CategoryDonut shares={shares} total={total} />
              ) : (
                <p className="text-muted">표시할 비중이 없습니다.</p>
              )}
            </section>

            <section className={CARD}>
              <h2 className="mb-3 text-section">이번 달 결제 예정</h2>
              {items.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {items.map((item) => {
                    // 카테고리가 없으면 "미분류" + slate.
                    // `toCategoryColor` 가 null 과 팔레트 밖 값을 모두 slate 로 떨어뜨린다.
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
                                  "일 (이번 달에 없는 날짜라 말일로 당김)"}
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
              ) : (
                <p className="text-muted">이번 달 결제 예정 항목이 없습니다.</p>
              )}
            </section>
          </div>
        )}

        <form
          className="mt-8"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className={BUTTON_SECONDARY}>
            로그아웃
          </button>
        </form>
      </div>
    </main>
  );
}
