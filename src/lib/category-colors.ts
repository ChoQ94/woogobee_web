/**
 * 카테고리 8색 팔레트의 단일 출처.
 *
 * 클래스명을 `bg-category-${color}-bg` 처럼 조립하지 않고 리터럴 문자열로 적어둔다.
 * Tailwind v4 는 소스를 **정적으로 훑어서** 쓰인 클래스만 CSS 로 만들기 때문에,
 * 템플릿 리터럴로 만든 이름은 빌드 시점에 존재하지 않는 것으로 취급돼
 * 에러 없이 색만 조용히 빠진다. 눈으로 알아채기 어려운 종류의 버그다.
 *
 * 이 파일은 화면(클라이언트 컴포넌트 포함)에서 import 하므로
 * auth·prisma 같은 서버 전용 코드를 절대 들이지 않는다. 순수 상수와 함수만 둔다.
 */

export const CATEGORY_COLORS = [
  "blue",
  "indigo",
  "emerald",
  "amber",
  "rose",
  "cyan",
  "orange",
  "slate",
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

/** 색 선택 UI 에 보여줄 한국어 이름. 사용자는 "indigo" 가 아니라 "남색"을 고른다. */
export const CATEGORY_COLOR_LABEL: Record<CategoryColor, string> = {
  blue: "파랑",
  indigo: "남색",
  emerald: "초록",
  amber: "황색",
  rose: "분홍",
  cyan: "청록",
  orange: "주황",
  slate: "회색",
};

/** 뱃지용 — 배경과 글자색을 함께 묶는다. 대비가 검증된 조합이라 쪼개 쓰지 않는다. */
export const CATEGORY_BADGE_CLASS: Record<CategoryColor, string> = {
  blue: "bg-category-blue-bg text-category-blue-text",
  indigo: "bg-category-indigo-bg text-category-indigo-text",
  emerald: "bg-category-emerald-bg text-category-emerald-text",
  amber: "bg-category-amber-bg text-category-amber-text",
  rose: "bg-category-rose-bg text-category-rose-text",
  cyan: "bg-category-cyan-bg text-category-cyan-text",
  orange: "bg-category-orange-bg text-category-orange-text",
  slate: "bg-category-slate-bg text-category-slate-text",
};

/** 달력 점(dot)용. 뱃지 배경보다 진해서 작은 면적에서도 색이 구분된다. */
export const CATEGORY_DOT_CLASS: Record<CategoryColor, string> = {
  blue: "bg-category-blue-dot",
  indigo: "bg-category-indigo-dot",
  emerald: "bg-category-emerald-dot",
  amber: "bg-category-amber-dot",
  rose: "bg-category-rose-dot",
  cyan: "bg-category-cyan-dot",
  orange: "bg-category-orange-dot",
  slate: "bg-category-slate-dot",
};

/**
 * DB 에 들어있는 `color` 문자열을 안전하게 좁힌다.
 *
 * DB 컬럼은 그냥 String 이라 팔레트 밖의 값이 들어갈 여지가 있고,
 * 카테고리가 없는 지출(`categoryId: null`)도 색이 필요하다.
 * 두 경우 모두 "미분류"의 색인 slate 로 떨어뜨린다 —
 * 화면이 색 하나 때문에 깨지는 것보다 회색으로 보이는 편이 낫다.
 */
export function toCategoryColor(value: string | null | undefined): CategoryColor {
  return CATEGORY_COLORS.includes(value as CategoryColor) ? (value as CategoryColor) : "slate";
}
