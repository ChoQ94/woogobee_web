"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ---------------------------------------------------------------------------
 * 하단 탭 바 — design.md {components.bottom-nav}
 *
 * 폰에서 한 손으로 쓰는 걸 전제로 하단에 고정한다. 흰 면에 위쪽 hairline 1px 만
 * 두고 그림자는 쓰지 않는다 (design.md 원칙 3 "경계는 그림자보다 선으로").
 *
 * 아이콘은 인라인 SVG 로 직접 그린다 — 네 개뿐이라 아이콘 세트를 의존성으로
 * 들일 이유가 없고, stroke 를 currentColor 로 두면 활성 색이 자동으로 따라온다.
 * 라벨 텍스트가 이미 이름을 말하므로 SVG 는 aria-hidden 이다 (<title> 중복 금지).
 * ------------------------------------------------------------------------- */

const ICON_PROPS = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/** 대시보드 — 사각을 4분할한 격자. */
function DashboardIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

/** 달력 — 상단 고리 2개 + 몸통 + 요일 줄 가로선. */
function CalendarIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M8 3v3" />
      <path d="M16 3v3" />
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

/** 지출 — 목록. 왼쪽 점 3개 + 오른쪽 줄 3개. */
function ExpensesIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 7h.01" />
      <path d="M4 12h.01" />
      <path d="M4 17h.01" />
      <path d="M9 7h11" />
      <path d="M9 12h11" />
      <path d="M9 17h11" />
    </svg>
  );
}

/** 카테고리 — 태그. 기울인 오각형 몸통 + 구멍. */
function CategoriesIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M11.4 3H4a1 1 0 0 0-1 1v7.4a2 2 0 0 0 .6 1.4l7 7a2 2 0 0 0 2.8 0l6.4-6.4a2 2 0 0 0 0-2.8l-7-7A2 2 0 0 0 11.4 3Z" />
      <path d="M7.5 7.5h.01" />
    </svg>
  );
}

const TABS = [
  { href: "/dashboard", label: "대시보드", Icon: DashboardIcon },
  { href: "/calendar", label: "달력", Icon: CalendarIcon },
  { href: "/expenses", label: "지출", Icon: ExpensesIcon },
  { href: "/categories", label: "카테고리", Icon: CategoriesIcon },
] as const;

/**
 * 활성 판정은 경로 접두사로 한다 — `/expenses/new`, `/expenses/123/edit` 에서도
 * "지출" 탭이 켜져야 사용자가 자기 위치를 잃지 않는다.
 *
 * `startsWith(href)` 만 쓰면 나중에 `/expenses-archive` 같은 경로가 생겼을 때
 * 오작동하므로 구분자 `/` 까지 붙여서 본다.
 */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-hairline bg-surface-card pb-safe-bottom"
    >
      <div className="mx-auto grid h-bottom-nav max-w-page grid-cols-4">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                "flex flex-col items-center justify-center gap-0.5 " +
                // 배경은 칠하지 않는다. 아이콘과 라벨 색만 바뀐다 —
                // 아이콘이 currentColor 라 글자색 하나로 따라온다.
                // 굵기도 함께 바뀌므로 색만으로 구분하는 게 아니다 (design.md).
                (active
                  ? "text-caption-strong text-primary-ink"
                  : "text-caption text-muted")
              }
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
