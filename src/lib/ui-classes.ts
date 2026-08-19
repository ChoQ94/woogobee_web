/**
 * design.md "컴포넌트" 절의 규격을 클래스 문자열 하나로 굳혀 둔 것.
 *
 * 왜 상수로 빼는가 — 버튼 하나가 화면 다섯 곳에 나오는데, 그때마다 손으로
 * 옮겨 적으면 언젠가 한 곳만 높이가 36px 이 된다. 규격을 바꿀 일이 생기면
 * 이 파일만 고친다.
 *
 * Tailwind v4 는 소스를 정적 스캔하므로 `.ts` 안의 문자열 리터럴도 그대로 수집한다.
 * 다만 **문자열을 조립하면 안 된다** — 아래 값은 전부 완성된 리터럴이다.
 */

/** `{component.card}` — 흰 면 + hairline 1px + 12px + 안여백 20px. 그림자 없음. */
export const CARD = "rounded-lg border border-hairline bg-surface-card p-5";

/** `{component.button-primary}` — primary-ink 채움. 브랜드 보라로 채우면 흰 글자 대비가 무너진다. */
export const BUTTON_PRIMARY =
  "inline-flex h-10 items-center justify-center rounded-md bg-primary-ink px-4 text-button text-on-primary transition-colors hover:bg-primary-deep disabled:bg-primary-light disabled:text-on-primary-soft";

/** `{component.button-secondary}` — 흰 배경 + hairline 테두리. */
export const BUTTON_SECONDARY =
  "inline-flex h-10 items-center justify-center rounded-md border border-hairline bg-surface-card px-4 text-button text-ink transition-colors hover:bg-surface-soft";

/** `{component.button-danger}` — 흰 배경에 danger 글자·테두리. 채움 빨강은 쓰지 않는다. */
export const BUTTON_DANGER =
  "inline-flex h-10 items-center justify-center rounded-md border border-danger bg-surface-card px-4 text-button text-danger transition-colors hover:bg-danger-tint";

/**
 * `{component.text-input}` — 높이 40px, hairline 1px.
 *
 * 포커스 규격은 "primary-ink 2px, 글로우·링 없음"이다. 테두리를 2px 로 키우면
 * 그만큼 안쪽이 밀려 글자가 1px 흔들리므로, 테두리 1px 바깥에 같은 색 outline 1px 을
 * 덧대 두께만 2px 로 보이게 한다. 퍼지는 그림자가 아니므로 "글로우 없음"에 어긋나지 않는다.
 */
export const INPUT =
  "h-10 w-full rounded-md border border-hairline bg-surface-card px-3 focus:border-primary-ink focus:outline-1 focus:outline-primary-ink";

/** `{component.amount-input}` — 같은 규격 + 우측 정렬 + amount 토큰(tabular-nums 병기). */
export const INPUT_AMOUNT =
  "h-10 w-full rounded-md border border-hairline bg-surface-card px-3 text-right text-amount tabular-nums focus:border-primary-ink focus:outline-1 focus:outline-primary-ink";

/**
 * 메모용 여러 줄 입력.
 *
 * design.md 에 textarea 규격이 없어서 `{component.text-input}` 에서 높이 고정만 빼고
 * 세로 여백(py-2)을 준 것이다. 테두리·모서리·포커스는 입력과 동일하다.
 */
export const TEXTAREA =
  "w-full rounded-md border border-hairline bg-surface-card px-3 py-2 focus:border-primary-ink focus:outline-1 focus:outline-primary-ink";

/** `{component.category-badge}` / `{component.yearly-badge}` 공통 골격. 색은 붙이는 쪽에서 정한다. */
export const BADGE = "inline-flex items-center rounded-sm px-2 py-0.5 text-badge";

/** `{component.yearly-badge}` — 브랜드 틴트. 카테고리 팔레트와 겹치지 않게 한다. */
export const BADGE_YEARLY =
  "inline-flex items-center rounded-sm bg-primary-tint px-2 py-0.5 text-badge text-on-primary-soft";

/** `{component.empty-state}` — surface-soft 바탕 + hairline-strong 점선. 일러스트는 넣지 않는다. */
export const EMPTY_STATE =
  "flex flex-col items-center gap-4 rounded-lg border border-dashed border-hairline-strong bg-surface-soft p-8 text-center";

/** 폼 필드 하나(라벨 + 입력 + 에러)를 감싸는 상자. 필드 사이 간격은 감싸는 쪽에서 gap-4(16px). */
export const FIELD = "flex flex-col gap-2";

/** 라벨 · 보조 설명. */
export const LABEL = "text-caption text-muted";

/** 검증 에러 한 줄. */
export const FIELD_ERROR = "text-caption text-danger";
