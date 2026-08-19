/**
 * 달 계산.
 *
 * 의존성이 하나도 없는 순수 함수만 둔다. 인증도 DB 도 만지지 않으므로
 * 어디서든(서버 컴포넌트·클라이언트·검증 스크립트) 그대로 부를 수 있다.
 *
 * 여기 있는 계산은 조용히 틀리는 종류다 — 2월 31일, 윤년, UTC 서버의 월 경계.
 * 그래서 집계·DB 코드(`dashboard.ts`)와 분리해 따로 검증할 수 있게 뒀다.
 */

/** `month` 는 1~12. `Date` 의 0-based 월과 섞이지 않도록 사람이 읽는 값으로 통일한다. */
export type MonthKey = { year: number; month: number };

export type Cycle = "MONTHLY" | "YEARLY";

/**
 * KST 기준 '지금'이 속한 달.
 *
 * 서버가 UTC 로 도는 순간 한국 시간 9월 1일 00:30 이 서버에서는 8월 31일이 되어
 * 총액이 통째로 한 달 어긋난다. `new Date().getMonth()` 는 런타임 타임존에 끌려가므로
 * 쓰지 않고, `Intl.DateTimeFormat` 에 `Asia/Seoul` 을 고정해 연·월을 뽑는다.
 * `format.ts` 가 날짜 표기에서 같은 이유로 KST 를 고정하고 있다.
 *
 * `now` 를 인자로 받는 건 테스트에서 임의 시각을 넣어보기 위해서다.
 */
const kstMonthFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "numeric",
});

export function currentMonth(now?: Date): MonthKey {
  const parts = kstMonthFormatter.formatToParts(now ?? new Date());
  const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: pick("year"), month: pick("month") };
}

/**
 * 그 달의 마지막 날. 윤년은 `Date` 가 알아서 계산해준다.
 *
 * `Date.UTC(year, month, 0)` 는 "다음 달 0일" = 이번 달 마지막 날이다.
 * `month` 가 1-based 이므로 그대로 넘기면 다음 달 인덱스가 된다.
 * 로컬 생성자 대신 UTC 를 쓰는 이유는 여기서도 런타임 타임존에 흔들리지 않기 위해서다.
 */
export function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * 결제일이 그 달에 없으면 마지막 날로 당긴 실제 일자.
 * `31` → 2월이면 28(윤년 29), 4·6·9·11월이면 30. 카드사·은행의 관행과 같다.
 */
export function resolvePaymentDay(year: number, month: number, paymentDay: number): number {
  const last = lastDayOfMonth(year, month);
  if (paymentDay < 1) return 1;
  return paymentDay > last ? last : paymentDay;
}

/**
 * 이 지출이 그 달에 결제되는가.
 *
 * 월납은 모든 달. 연납은 `paymentMonth` 가 일치하는 달에만 **전액**.
 * 연납인데 `paymentMonth` 가 `null` 인 건 데이터가 깨진 경우다 —
 * 어느 달에도 넣지 않는다. 임의의 달에 끼워 넣으면 그 달 총액이 이유 없이 튄다.
 */
export function isDueInMonth(cycle: Cycle, paymentMonth: number | null, month: MonthKey): boolean {
  if (cycle === "MONTHLY") return true;
  return paymentMonth !== null && paymentMonth === month.month;
}
