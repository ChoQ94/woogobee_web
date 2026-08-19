/**
 * 화면 표시용 포맷 함수 모음.
 *
 * 여기에는 DB 접근이 없다 — 순수 함수만 둔다. 그래야 서버 컴포넌트와
 * 클라이언트 컴포넌트 양쪽에서 그대로 import 할 수 있다.
 */

/** `Expense.cycle` 과 같은 값. Prisma 타입을 클라이언트 컴포넌트까지 끌고 오지 않으려고 따로 선언한다. */
export type Cycle = "MONTHLY" | "YEARLY";

/**
 * 금액 표기. `1,240,000원` 형태.
 *
 * design.md "금액 표기 > 형식":
 * - 천 단위 콤마, 원 단위 정수
 * - **축약하지 않는다.** `124만원` 같은 표기는 쓰지 않는다
 * - 0원은 `0원`. 빈칸이나 `-` 로 두지 않는다
 *
 * 이 함수는 숫자만 만든다. 자릿수 정렬(`tabular-nums`)은 CSS 쪽 일이라
 * 렌더하는 곳에서 `text-amount tabular-nums` 를 반드시 병기해야 한다
 * — Tailwind v4 는 `--text-*` 토큰에 `font-variant-numeric` 을 실어주지 않는다.
 */
export function formatAmount(amount: number): string {
  return Math.trunc(amount).toLocaleString("ko-KR") + "원";
}

/**
 * 각 달에 존재할 수 있는 최대 일수. 2월이 29인 건 윤년 때문이다 —
 * "매년 2월 29일"은 윤년에 실제로 오는 날이지만 "2월 30일"은 어느 해에도 없다.
 */
const MAX_DAY_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * 결제 주기 표기. `매월 25일` / `매년 3월 25일`.
 *
 * **없는 날짜를 그대로 쓰지 않는다.** `paymentDay = 31` 인 연납 항목의
 * 결제월이 2월이면 "매년 2월 31일"은 어느 해에도 오지 않는 날이므로
 * "매년 2월 말일"로 표시한다. 실제 결제는 그 달 마지막 날에 일어난다
 * (PROJECT.md §2 "결제일이 그 달에 없으면 마지막 날로 당긴다").
 *
 * 월납은 달이 정해져 있지 않으므로 `매월 31일` 을 그대로 쓴다 —
 * 이건 "31일에 나간다, 없는 달은 말일" 이라는 규칙의 진술이지 특정 날짜가 아니다.
 * 실제 날짜로 펼치는 건 달력(5단계)의 몫이다.
 *
 * 연납인데 `paymentMonth` 가 비어 있는 건 데이터가 깨진 경우다.
 * 화면을 죽이지 않고 달만 빼고 보여준다.
 */
export function formatPaymentSchedule(
  cycle: Cycle,
  paymentDay: number,
  paymentMonth: number | null,
): string {
  if (cycle !== "YEARLY") return "매월 " + paymentDay + "일";
  if (paymentMonth === null) return "매년 " + paymentDay + "일";

  const maxDay = MAX_DAY_IN_MONTH[paymentMonth - 1] ?? 31;
  const day = paymentDay > maxDay ? "말일" : paymentDay + "일";
  return "매년 " + paymentMonth + "월 " + day;
}

/**
 * 날짜 표기. `2026년 8월 19일`.
 *
 * 서버 런타임의 타임존이 무엇이든 같은 결과가 나오도록 `Asia/Seoul` 을 고정한다.
 * 이걸 빼면 서버(UTC)와 브라우저(KST)의 결과가 하루 어긋나 하이드레이션이 흔들린다.
 */
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}
