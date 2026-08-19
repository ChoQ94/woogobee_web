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

/**
 * KST 기준 오늘.
 *
 * `currentMonth` 와 같은 이유로 `Intl.DateTimeFormat` 에 `Asia/Seoul` 을 고정한다.
 * 달력의 '오늘' 강조는 하루 단위라 타임존 오차가 그대로 눈에 보인다 —
 * UTC 서버에서 `new Date().getDate()` 를 쓰면 한국 시간 9월 1일 00:30 에
 * 8월 31일 칸이 강조된다. `now` 는 테스트에서 임의 시각을 넣기 위한 인자다.
 */
const kstDayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

export function todayInKst(now?: Date): { year: number; month: number; day: number } {
  const parts = kstDayFormatter.formatToParts(now ?? new Date());
  const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: pick("year"), month: pick("month"), day: pick("day") };
}

/**
 * 달 이동. `delta` 는 음수도 되고 여러 해를 건너뛰어도 된다.
 *
 * 한 달씩 반복하며 12 를 넘길 때마다 연도를 올리는 방식은 delta 가 커질수록
 * 실수하기 쉽다. 대신 `year * 12 + (month - 1)` 로 절대 월 번호를 만들어
 * 한 번에 더하고 되돌린다. `Math.floor` 는 음수에서도 아래로 내림이라
 * 1월에서 뒤로 갈 때 전년도 12월이 정확히 나온다.
 */
export function addMonths(month: MonthKey, delta: number): MonthKey {
  const index = month.year * 12 + (month.month - 1) + delta;
  return { year: Math.floor(index / 12), month: (((index % 12) + 12) % 12) + 1 };
}

export type CalendarCell = {
  year: number;
  /** 1~12. `MonthKey` 와 같이 사람이 읽는 값이다. */
  month: number;
  day: number;
  /** 조회 중인 달에 속하는가. false 면 앞뒤 달에서 끌어온 칸이다. */
  inMonth: boolean;
};

/**
 * 월간 격자. **일요일 시작**(한국 달력 관행), 길이는 항상 7 의 배수.
 *
 * 앞뒤 빈칸은 `null` 로 두지 않고 이웃 달의 실제 날짜로 채운다 —
 * `design.md` 의 `calendar-cell-outside-month` 가 흐린 날짜를 그리도록 정해져 있고,
 * 그러려면 화면이 아니라 여기서 연·월·일이 나와야 한다.
 *
 * 이웃 달은 `addMonths` 로 구해서 **연도 넘김을 한 곳에서만** 처리한다.
 * 1월 격자의 앞칸은 전년도 12월, 12월 격자의 뒷칸은 다음 해 1월이다.
 * 여기서 연도를 그대로 두면 `year` 가 어긋난 칸이 조용히 섞인다.
 *
 * 요일은 `Date.UTC` 로 만든 날짜의 `getUTCDay()`(0=일요일)로 구한다.
 * 로컬 `Date` 생성자는 런타임 타임존에 따라 하루 밀려 격자 전체가 어긋난다.
 *
 * 6 주로 억지로 채우지 않는다. 필요한 주만 만들어 5 주짜리 달은 5 주로 끝낸다.
 */
export function buildMonthGrid(month: MonthKey): CalendarCell[] {
  const firstWeekday = new Date(Date.UTC(month.year, month.month - 1, 1)).getUTCDay();
  const daysInMonth = lastDayOfMonth(month.year, month.month);

  const cells: CalendarCell[] = [];

  // 앞칸: 이전 달의 마지막 날에서 거슬러 올라간 만큼.
  const prev = addMonths(month, -1);
  const prevLastDay = lastDayOfMonth(prev.year, prev.month);
  for (let i = firstWeekday; i > 0; i--) {
    cells.push({ year: prev.year, month: prev.month, day: prevLastDay - i + 1, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ year: month.year, month: month.month, day, inMonth: true });
  }

  // 뒷칸: 다음 달 1 일부터, 마지막 주가 토요일로 끝날 때까지.
  const next = addMonths(month, 1);
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= trailing; day++) {
    cells.push({ year: next.year, month: next.month, day, inMonth: false });
  }

  return cells;
}
