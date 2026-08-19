---
version: alpha
name: NEEDS-design-system
description: A quiet, numbers-first personal finance system built on a pure white canvas where roughly 90% of every screen is neutral slate ink and hairlines, and a single drop of light purple carries meaning. The brand purple (#c38ed5) is too light to hold white text, so a darker sibling (#6B4A8A) was derived to fill actions and links while the original stays as the atmospheric voice — today's calendar ring, selection borders, chart fills. Type runs Pretendard so Korean glyphs and Latin digits share one impression, and every amount renders in tabular-nums because fixed expenses stack vertically and misaligned digits are the fastest way to make a money screen feel untrustworthy. Boundaries are drawn with 1px hairlines rather than shadows — the system defines exactly one shadow tier, reserved for modals and dropdowns that genuinely float.

colors:
  primary: "#c38ed5"
  primary-light: "#d7abe6"
  primary-mid: "#b69ccf"
  primary-deep: "#9878b7"
  primary-ink: "#6B4A8A"
  primary-tint: "#f9edfd"
  on-primary: "#FFFFFF"
  on-primary-soft: "#3B2450"
  canvas: "#FFFFFF"
  surface-soft: "#F8FAFC"
  surface-card: "#FFFFFF"
  hairline: "#E2E8F0"
  hairline-strong: "#CBD5E1"
  ink: "#0F172A"
  body: "#334155"
  muted: "#64748B"
  subtle: "#94A3B8"
  danger: "#DC2626"
  danger-tint: "#FEF2F2"
  success: "#059669"
  scrim: "#0F172A"
  category-blue-bg: "#EFF6FF"
  category-blue-text: "#1D4ED8"
  category-blue-dot: "#3B82F6"
  category-indigo-bg: "#EEF2FF"
  category-indigo-text: "#4338CA"
  category-indigo-dot: "#6366F1"
  category-emerald-bg: "#ECFDF5"
  category-emerald-text: "#047857"
  category-emerald-dot: "#10B981"
  category-amber-bg: "#FFFBEB"
  category-amber-text: "#B45309"
  category-amber-dot: "#F59E0B"
  category-rose-bg: "#FFF1F2"
  category-rose-text: "#BE123C"
  category-rose-dot: "#F43F5E"
  category-cyan-bg: "#ECFEFF"
  category-cyan-text: "#0E7490"
  category-cyan-dot: "#06B6D4"
  category-orange-bg: "#FFF7ED"
  category-orange-text: "#C2410C"
  category-orange-dot: "#F97316"
  category-slate-bg: "#F8FAFC"
  category-slate-text: "#475569"
  category-slate-dot: "#64748B"

typography:
  display:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
    fontVariantNumeric: tabular-nums
  display-sm:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.01em
    fontVariantNumeric: tabular-nums
  title:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  section:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  body:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-strong:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: 0
  caption:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  caption-strong:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  badge:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  amount-lg:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.01em
    fontVariantNumeric: tabular-nums
  amount:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
    fontVariantNumeric: tabular-nums
  amount-sm:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
    fontVariantNumeric: tabular-nums
  button:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0
  nav-link:
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  section: 40px

components:
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 20px
    border: "1px solid {colors.hairline}"
  card-header:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.section}"
    padding: 0 0 12px 0
  button-primary:
    backgroundColor: "{colors.primary-ink}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 0 16px
    height: 40px
    border: none
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 40px
  button-primary-disabled:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.on-primary-soft}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 40px
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 0 16px
    height: 40px
    border: "1px solid {colors.hairline}"
  button-danger:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.danger}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 0 16px
    height: 40px
    border: "1px solid {colors.danger}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 0 12px
    height: 40px
    border: "1px solid {colors.hairline}"
  amount-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.amount}"
    rounded: "{rounded.md}"
    padding: 0 12px
    height: 40px
    border: "1px solid {colors.hairline}"
    textAlign: right
  select:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 0 12px
    height: 40px
    border: "1px solid {colors.hairline}"
  category-badge:
    backgroundColor: "{colors.category-slate-bg}"
    textColor: "{colors.category-slate-text}"
    typography: "{typography.badge}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
    border: none
  yearly-badge:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.on-primary-soft}"
    typography: "{typography.badge}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
    border: none
  total-summary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.lg}"
    padding: 24px 20px
    border: "1px solid {colors.hairline}"
  expense-row:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
    padding: 12px
    border: none
  expense-row-selected:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
    padding: 12px
    border: "1px solid {colors.primary}"
  expense-row-ended:
    backgroundColor: transparent
    textColor: "{colors.subtle}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 12px
    textDecoration: line-through
  calendar-grid:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.hairline}"
  calendar-cell:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: 8px
    border: "1px solid {colors.hairline}"
  calendar-cell-today:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.caption-strong}"
    rounded: "{rounded.none}"
    padding: 8px
    border: "1px solid {colors.primary}"
  calendar-cell-outside-month:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.subtle}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: 8px
    border: "1px solid {colors.hairline}"
  calendar-dot:
    backgroundColor: "{colors.category-slate-dot}"
    rounded: "{rounded.full}"
    height: 6px
  calendar-day-total:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.amount-sm}"
    padding: 4px 0 0 0
  calendar-overflow-label:
    backgroundColor: transparent
    textColor: "{colors.subtle}"
    typography: "{typography.caption}"
  donut-chart:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.lg}"
    padding: 20px
    border: "1px solid {colors.hairline}"
  empty-state:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 40px 20px
    border: "1px dashed {colors.hairline-strong}"
  modal:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 24px
    border: none
  dropdown:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 6px
    border: "1px solid {colors.hairline}"
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    typography: "{typography.nav-link}"
    height: 56px
    border: "0 0 1px 0 solid {colors.hairline}"
  nav-link-active:
    backgroundColor: transparent
    textColor: "{colors.primary-ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.none}"
---

## 원칙

1. **숫자가 주인공이다.** 장식은 숫자를 읽는 걸 방해하지 않는 선까지만 쓴다.
2. **색은 의미가 있을 때만 쓴다.** 카테고리 구분이나 상태 표시가 아니면 무채색이다.
3. **경계는 그림자보다 선으로.** 그림자를 남발하면 금융 정보가 가벼워 보인다.

## 개요

이 시스템은 흰 캔버스(`{colors.canvas}` — #FFFFFF) 위에 무채색 잉크로 대부분을 해결하고,
보라를 한 방울만 떨어뜨린다. 화면의 90%는 `{colors.ink}` · `{colors.body}` · `{colors.muted}`
세 단계의 글자색과 `{colors.hairline}` 한 줄이면 끝난다. 보라가 나타나는 자리는
행동(버튼·링크), 선택 상태, 오늘 날짜, 도넛 차트뿐이다.

이 절제는 취향이 아니라 요구사항이다. 사용자가 이 화면을 여는 이유는 "이번 달에
얼마가 나가는가"를 정확히 확인하려는 것 하나다. 배경이 색을 띠거나 카드마다
그림자가 깔리면 시선이 숫자에서 밀려난다. 그래서 카드는 그림자 없이 1px 선으로만
구분하고, 그림자 티어는 실제로 떠 있어야 하는 모달과 드롭다운에만 남겨두었다.

타이포는 **Pretendard** 하나로 전부 처리한다. 스케일의 정점은 대시보드 총액을 담는
`{typography.display}`(40px / 700)이고, 나머지는 15px 본문 주위에 촘촘히 모여 있다.
금액을 담는 토큰 — `{typography.display}`, `{typography.display-sm}`,
`{typography.amount-lg}`, `{typography.amount}`, `{typography.amount-sm}` — 은 예외 없이
`tabular-nums` 를 켠다.

형태 언어는 절제된 둥근 모서리다. 뱃지 6px, 버튼·입력 8px, 카드 12px, 모달 16px.
원형은 달력의 카테고리 점 하나뿐이다.

## 컬러

### 브랜드 보라

사용자가 지정한 연보라 팔레트를 그대로 쓴다. 다만 **연보라는 흰 글자를 얹을 수 없어서**
행동색을 따로 파생시켰다. 아래 대비 수치는 흰색(#FFFFFF) 기준이다.

| 토큰 | 값 | 흰 글자 대비 | 용도 |
|---|---|---|---|
| `{colors.primary}` | `#c38ed5` | 2.58:1 | 브랜드 보이스. 오늘 날짜 링, 선택 상태 테두리, 도넛 주색. **흰 글자 금지** |
| `{colors.primary-light}` | `#d7abe6` | — | hover 틴트, 비활성 채움 |
| `{colors.primary-mid}` | `#b69ccf` | — | 보조 선, 차트 2차색 |
| `{colors.primary-deep}` | `#9878b7` | 3.68:1 | 아이콘 스트로크, 큰 글자. **본문 금지** |
| `{colors.primary-ink}` | `#6B4A8A` | 7.07:1 | 주요 버튼 채움, 링크, 포커스 링 |
| `{colors.primary-tint}` | `#f9edfd` | — | 선택된 행, 뱃지 배경, hover 배경 |
| `{colors.on-primary}` | `#FFFFFF` | — | `{colors.primary-ink}` 위에만 사용 |
| `{colors.on-primary-soft}` | `#3B2450` | — | `{colors.primary}` / `{colors.primary-light}` 위 글자색 |

**왜 색이 둘인가.** `{colors.primary}`(#c38ed5)는 밝아서 흰 글자를 얹으면 2.58:1 밖에
안 나온다. WCAG AA 본문 기준 4.5:1 은 물론이고 큰 글자 기준 3:1 도 아슬아슬하다.
버튼을 이 색으로 채우면 라벨이 읽히지 않는다. 그래서 같은 계열에서 명도를 낮춘
`{colors.primary-ink}`(#6B4A8A, 7.07:1)를 파생시켜 **채움과 링크는 전부 이쪽**이 맡는다.
원래 색은 글자를 얹지 않는 자리 — 테두리, 링, 차트 면 — 에서 브랜드 인상을 담당한다.

`{colors.primary-deep}`(#9878b7)는 3.68:1 이다. 18px 이상 큰 글자와 아이콘 스트로크까지만
허용하고 본문에는 쓰지 않는다.

### 무채색

화면의 90%는 이 안에서 해결한다.

| 토큰 | 값 | 용도 |
|---|---|---|
| `{colors.canvas}` | `#FFFFFF` | 페이지 배경 |
| `{colors.surface-soft}` | `#F8FAFC` | 테이블 헤더, 빈 상태 바탕, 달력의 이번 달 밖 칸 |
| `{colors.surface-card}` | `#FFFFFF` | 카드 면. 캔버스와 같은 흰색이고 구분은 선이 한다 |
| `{colors.hairline}` | `#E2E8F0` | 카드 테두리, 구분선, 입력 테두리 |
| `{colors.hairline-strong}` | `#CBD5E1` | 강조 구분선, 빈 상태의 점선 테두리 |
| `{colors.ink}` | `#0F172A` | 본문, 금액, 제목 |
| `{colors.body}` | `#334155` | 긴 설명문, 내비 라벨 |
| `{colors.muted}` | `#64748B` | 라벨, 날짜, 보조 설명 |
| `{colors.subtle}` | `#94A3B8` | 비활성, 플레이스홀더, 해지된 항목 |

### 의미색

| 토큰 | 값 | 용도 |
|---|---|---|
| `{colors.danger}` | `#DC2626` | 삭제, 해지, 유효성 오류 |
| `{colors.danger-tint}` | `#FEF2F2` | 오류 배너 배경 |
| `{colors.success}` | `#059669` | 저장 완료 등 성공 피드백 |
| `{colors.scrim}` | `#0F172A` | 모달 뒷배경. 50% 불투명도로 렌더 |

### 카테고리 팔레트

**사용자는 이 8색 중에서만 고를 수 있다.** 자유 색상 선택을 허용하면 달력에서 대비가
무너지고 읽히지 않는 조합이 나온다. 각 색은 세 가지 값으로 쓰인다 — 뱃지 배경,
뱃지 글자, 점(dot).

| 토큰 | 이름 | 배경 | 글자 | 점 |
|---|---|---|---|---|
| `blue` | 파랑 | `{colors.category-blue-bg}` #EFF6FF | `{colors.category-blue-text}` #1D4ED8 | `{colors.category-blue-dot}` #3B82F6 |
| `indigo` | 남색 | `{colors.category-indigo-bg}` #EEF2FF | `{colors.category-indigo-text}` #4338CA | `{colors.category-indigo-dot}` #6366F1 |
| `emerald` | 초록 | `{colors.category-emerald-bg}` #ECFDF5 | `{colors.category-emerald-text}` #047857 | `{colors.category-emerald-dot}` #10B981 |
| `amber` | 황색 | `{colors.category-amber-bg}` #FFFBEB | `{colors.category-amber-text}` #B45309 | `{colors.category-amber-dot}` #F59E0B |
| `rose` | 분홍 | `{colors.category-rose-bg}` #FFF1F2 | `{colors.category-rose-text}` #BE123C | `{colors.category-rose-dot}` #F43F5E |
| `cyan` | 청록 | `{colors.category-cyan-bg}` #ECFEFF | `{colors.category-cyan-text}` #0E7490 | `{colors.category-cyan-dot}` #06B6D4 |
| `orange` | 주황 | `{colors.category-orange-bg}` #FFF7ED | `{colors.category-orange-text}` #C2410C | `{colors.category-orange-dot}` #F97316 |
| `slate` | 회색 | `{colors.category-slate-bg}` #F8FAFC | `{colors.category-slate-text}` #475569 | `{colors.category-slate-dot}` #64748B |

**`violet` 을 빼고 `indigo` 를 넣었다.** 예전 팔레트에 있던 `violet` 은 브랜드 보라와
같은 계열이라 충돌한다. 달력에서 보라 점이 찍히면 사용자는 그걸 "카테고리"가 아니라
"선택됨"으로 읽는다. 브랜드색은 상태를 뜻해야 하고 카테고리색은 분류를 뜻해야 하므로,
같은 색조를 두 의미에 겹쳐 쓸 수 없다. 그래서 파랑 옆 자리를 남색으로 대체했다.

`slate` 는 **미분류 항목의 기본값**이다. 카테고리를 삭제하면 그 카테고리의 지출은
지워지지 않고 `categoryId` 만 `null` 이 되는데(`onDelete: SetNull`), 이때 화면에서는
회색 "미분류"로 표시된다.

기본 카테고리 시드는 이렇게 배정한다:
주거 `blue` / 보험 `emerald` / 구독 `indigo` / 통신 `amber` / 기타 `slate`

### 다크모드

**지금은 라이트만 구현한다.** 다만 위 값을 전부 CSS 변수로 선언해서, 나중에 변수 값만
바꿔 끼우면 되도록 구조를 잡아둔다. 컴포넌트 안에 하드코딩된 색을 쓰지 않는다.
Tailwind v4 를 쓰므로 토큰은 `src/app/globals.css` 의 `@theme` 블록에 선언한다
(`tailwind.config.js` 는 만들지 않는다).

## 타이포그래피

### 폰트

**Pretendard** 를 사용한다. Next.js 기본값인 Geist 는 라틴 전용이라 한글이 시스템 폰트로
떨어지고, 그러면 한글과 숫자의 인상이 따로 논다. 항목명은 한글이고 금액은 숫자인
화면에서 이 불일치는 그대로 드러난다.

```
--font-sans: "Pretendard Variable", Pretendard, -apple-system, system-ui, sans-serif;
```

### 스케일

| 토큰 | 크기 | 굵기 | 행간 | 자간 | 용도 |
|---|---|---|---|---|---|
| `{typography.display}` | 40px | 700 | 1.1 | -0.02em | 대시보드 총액 (tabular-nums) |
| `{typography.display-sm}` | 28px | 700 | 1.15 | -0.01em | 카드 내 소계 (tabular-nums) |
| `{typography.title}` | 24px | 600 | 1.3 | -0.01em | 페이지 제목 |
| `{typography.section}` | 18px | 600 | 1.4 | 0 | 섹션 헤더 |
| `{typography.body}` | 15px | 400 | 1.6 | 0 | 본문, 목록 |
| `{typography.body-strong}` | 15px | 600 | 1.6 | 0 | 목록 항목명 |
| `{typography.caption}` | 13px | 400 | 1.4 | 0 | 라벨, 날짜, 보조 설명 |
| `{typography.caption-strong}` | 13px | 600 | 1.4 | 0 | 테이블 헤더 |
| `{typography.badge}` | 12px | 600 | 1.2 | 0 | 카테고리·연납 뱃지 |
| `{typography.amount-lg}` | 28px | 700 | 1.2 | -0.01em | 큰 금액 (tabular-nums) |
| `{typography.amount}` | 15px | 500 | 1.5 | 0 | 목록 금액 (tabular-nums) |
| `{typography.amount-sm}` | 13px | 400 | 1.4 | 0 | 달력 셀 합계 (tabular-nums) |
| `{typography.button}` | 15px | 500 | 1.2 | 0 | 버튼 라벨 |
| `{typography.nav-link}` | 15px | 500 | 1.2 | 0 | 상단 내비 |

큰 글씨는 총액 한 곳에만 허용한다. `{typography.display}` 가 40px 인 이유는 그 숫자가
사용자가 이 서비스를 여는 이유이기 때문이고, 나머지가 15px 근처에 몰려 있는 이유도
같다. 제목이 커지면 총액이 상대적으로 작아 보인다.

## 금액 표기

**이 프로젝트에서 가장 자주 반복되는 규칙이다.**

### 반드시 `tabular-nums` 를 적용한다

기본 폰트는 숫자마다 폭이 다르다(`1`은 좁고 `8`은 넓다). 금액이 세로로 쌓이는 목록에서
자릿수가 어긋나 보이고, 그러면 금액을 비교하기가 어려워진다.

```css
.amount { font-variant-numeric: tabular-nums; }
```

금액을 담는 타이포 토큰(`{typography.display}`, `{typography.display-sm}`,
`{typography.amount-lg}`, `{typography.amount}`, `{typography.amount-sm}`)에는
`fontVariantNumeric: tabular-nums` 가 이미 들어 있다. 금액에는 반드시 이 토큰 중 하나를 쓴다.

### 형식

- 천 단위 콤마, 원 단위 정수: `1,240,000원`
- **축약하지 않는다.** `124만원` 같은 표기는 쓰지 않는다. 고정지출은 정확한 금액을
  확인하려고 보는 화면이다.
- 0원은 `0원` 으로 표시한다. 빈칸이나 `-` 로 두지 않는다.
- `Expense.amount` 는 원 단위 `Int` 다. 부동소수점 오차를 피하려고 `Float` 을 쓰지 않는다.

### 연납 항목

달력과 총액에는 **실제 결제되는 달에 전액**을 표시한다. 12로 나눠 분산하지 않는다.
자동차보험 60만원은 결제되는 달에 600,000원으로 잡히고 나머지 열한 달에는 0원이다.
그 달만 총액이 튀는 게 정상이다.

대신 목록에서 `{component.yearly-badge}` 로 `연납` 뱃지를 붙여, 왜 그 달만 큰지
사용자가 이유를 알 수 있게 한다.

### 결제일 보정

`paymentDay` 가 그 달에 없으면 **그 달 마지막 날로 당긴다.** `paymentDay = 31` 인 항목은
2월에 28일(윤년이면 29일)에 표시되고, 4·6·9·11월에는 30일에 표시된다. 실제 카드사·은행의
관행과 같다. 달력을 만들면 반드시 마주치는 문제이므로 표시 로직 한 곳에서 처리한다.

## 레이아웃

### 간격 시스템

- **기본 단위:** 4px (2px 마이크로 스텝 포함)
- **토큰:** `{spacing.xxs}` 2px · `{spacing.xs}` 4px · `{spacing.sm}` 8px ·
  `{spacing.md}` 12px · `{spacing.base}` 16px · `{spacing.lg}` 20px ·
  `{spacing.xl}` 24px · `{spacing.xxl}` 32px · `{spacing.section}` 40px

| 대상 | 값 |
|---|---|
| 카드 안쪽 여백 | `{spacing.lg}` 20px |
| 섹션 사이 | `{spacing.xl}` 24px |
| 목록 항목 사이 | `{spacing.md}` 12px |
| 폼 필드 사이 | `{spacing.base}` 16px |

### 모서리

| 대상 | 반경 |
|---|---|
| 뱃지 | `{rounded.sm}` 6px |
| 버튼 · 입력 | `{rounded.md}` 8px |
| 카드 | `{rounded.lg}` 12px |
| 모달 | `{rounded.xl}` 16px |
| 달력 점 | `{rounded.full}` |

### 컨테이너

- **최대 폭 1120px**, 가운데 정렬. 대시보드와 달력 모두 같은 폭을 쓴다.
  달력이 7열이므로 1120px 이면 한 칸이 약 155px — 카테고리 이름 서너 글자와
  그날 합계가 줄바꿈 없이 들어간다. 더 넓히면 칸이 비어 보이고, 좁히면 이름이 잘린다.
- **대시보드:** 총액 카드가 폭 전체를 차지하고, 그 아래 카테고리 비중과 결제 예정 목록이
  2열로 나뉜다.
- **좌우 여백:** 데스크톱 `{spacing.xxl}` 32px, 모바일 `{spacing.base}` 16px.

### 여백 철학

카드 안은 넉넉하게(20px), 카드 사이는 촘촘하게(12–24px) 둔다. 고정지출은 항목이 20개를
넘어가면 스크롤이 길어지므로, 항목 사이를 벌리는 대신 항목 안에서 숨 쉴 공간을 준다.

## 엘리베이션

**그림자 티어는 하나뿐이다.**

- **평면 (그림자 없음):** 카드, 목록, 달력, 차트, 상단 내비 — 화면의 거의 전부.
  구분은 `{colors.hairline}` 1px 선이 한다.
- **떠 있는 요소:** `{component.modal}` 과 `{component.dropdown}` 만 그림자를 쓴다.
  이 둘은 실제로 다른 레이어에 있고, 사용자도 그렇게 인식해야 한다.
  `box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.06)`
- **스크림:** `{colors.scrim}` 을 50% 불투명도로 깐다. 모달 뒷배경 전용.

그림자를 남발하면 금융 정보가 가벼워 보인다. 카드마다 그림자가 깔린 화면은 정보의
위계가 아니라 질감만 늘어난다. 깊이가 필요하면 먼저 선과 여백으로 해결하고,
그래도 안 되면 그때 이 문서에 티어를 추가한다.

## 컴포넌트

### 카드

**`card`** — 흰 배경(`{colors.surface-card}`) + `{colors.hairline}` 1px 테두리 +
`{rounded.lg}` 12px + 안쪽 여백 20px. 그림자 없음. 카드 제목은 `{component.card-header}`
(`{typography.section}`)로 얹고 아래로 12px 띄운다.

**`total-summary`** — 대시보드 최상단. 이번 달 실제 결제액 하나만 `{typography.display}`
로 크게 보여준다. 라벨("2026년 8월 결제 예정")은 위에 `{typography.caption}` `{colors.muted}`.
월 평균 부담액 같은 파생 숫자는 넣지 않는다 — 사용자가 원한 건 실제 결제액 하나다.

### 버튼

모두 높이 40px, `{rounded.md}` 8px.

**`button-primary`** — `{colors.primary-ink}` 채움 + `{colors.on-primary}` 흰 글자(7.07:1).
브랜드 보라(`{colors.primary}`)로 채우면 안 된다. hover 시 `{colors.primary-deep}`.

**`button-primary-disabled`** — `{colors.primary-light}` 채움 + `{colors.on-primary-soft}` 글자.
연한 면 위에는 흰 글자를 얹지 않는다.

**`button-secondary`** — 흰 배경, `{colors.hairline}` 1px 테두리, `{colors.ink}` 글자.

**`button-danger`** — 흰 배경, `{colors.danger}` 글자와 테두리. 삭제·해지 전용.
채움 빨강은 쓰지 않는다 — 목록 옆에 빨간 덩어리가 있으면 시선이 그리로 끌린다.

### 입력

**`text-input`** — 높이 40px, `{colors.hairline}` 1px 테두리.
포커스 시 테두리가 `{colors.primary-ink}` 2px 로 두꺼워진다. **글로우나 링은 없다.**

**`amount-input`** — 같은 규격에 **우측 정렬** + `{typography.amount}`(tabular-nums).
입력 중에도 자릿수가 흔들리지 않아야 한다.

**`select`** — 카테고리·주기 선택. 같은 규격.

### 뱃지

**`category-badge`** — 해당 카테고리 색의 배경/글자 조합, `{rounded.sm}` 6px,
패딩 `2px 8px`, `{typography.badge}`. 프론트매터의 기본값은 `slate`(미분류)이고,
실제 렌더 시 카테고리 토큰에 맞춰 `category-{token}-bg` / `-text` 를 갈아 끼운다.

**`yearly-badge`** — `연납` 표시. `{colors.primary-tint}` 배경 + `{colors.on-primary-soft}` 글자.
카테고리 팔레트와 겹치지 않게 브랜드 틴트를 쓴다.

### 목록 행

**`expense-row`** — 항목명(`{typography.body-strong}`) + 카테고리 뱃지 + 연납 뱃지가 왼쪽,
금액(`{typography.amount}`)이 오른쪽. 행 사이 구분선은 없고 12px 간격으로만 나눈다.

**`expense-row-selected`** — `{colors.primary-tint}` 배경 + `{colors.primary}` 1px 테두리.

**`expense-row-ended`** — 해지된 항목(`Expense.endedAt` 이 채워진 항목).
`{colors.subtle}` 글자 + 취소선. **삭제하지 않는다** — 삭제해 버리면 "작년 3월엔 얼마
나갔지?"를 다시 볼 수 없다. 기본 화면에서는 숨기고, 지난 달을 볼 때만 흐리게 보여준다.

### 달력 셀

**`calendar-cell`** — 규칙은 전부 지킨다.

- 날짜 숫자는 **좌상단**, `{typography.caption}`
- 결제 항목은 **카테고리 점(dot) + 이름**, 최대 3개까지. 넘치면
  `{component.calendar-overflow-label}` 로 `+2건` 표기
- 셀 하단에 **그날 합계 금액**, `{component.calendar-day-total}`
  (`{typography.amount-sm}`, tabular-nums)
- 점은 6px 원, 해당 카테고리의 `-dot` 값

**`calendar-cell-today`** — `{colors.primary}` 1px 테두리. **채움이 아니라 테두리**다.
연보라로 칸을 채우면 그 위의 날짜 숫자와 항목명 대비가 무너진다.

**`calendar-cell-outside-month`** — 앞뒤 달의 날짜. `{colors.surface-soft}` 바탕 +
`{colors.subtle}` 글자.

**결제일 보정은 달력에서 가장 자주 드러난다.** `paymentDay = 31` 인 항목은 2월 칸에서
28일(윤년 29일)에 나타난다. 연납 항목은 `paymentMonth` 가 맞는 달에만, 전액으로 나타난다.

### 도넛

**`donut-chart`** — 카테고리별 비중. 조각 색은 각 카테고리의 `-dot` 값을 그대로 쓴다.
차트가 카테고리 뱃지·달력 점과 같은 색을 공유해야 사용자가 세 화면을 연결해서 읽는다.
중앙에는 총액을 `{typography.amount-lg}` 로 얹는다. 범례는 항목명 + 금액 +
`{typography.caption}` 퍼센트.

### 빈 상태

**`empty-state`** — `{colors.surface-soft}` 바탕에 `{colors.hairline-strong}` 점선 테두리.
"아직 등록한 고정지출이 없습니다" 한 줄과 추가 버튼 하나. 일러스트는 넣지 않는다.

### 모달 · 드롭다운

**`modal`** — `{rounded.xl}` 16px, 패딩 24px, 그림자 티어 적용.
뒷배경은 `{colors.scrim}` 50%.

**`dropdown`** — `{rounded.lg}` 12px, `{colors.hairline}` 1px 테두리 + 그림자.
항목 hover 는 `{colors.primary-tint}`.

### 상단 내비

**`top-nav`** — 높이 56px, 흰 배경, 하단 `{colors.hairline}` 1px.
링크는 `{colors.body}`, 현재 페이지는 `{component.nav-link-active}`
(`{colors.primary-ink}`). 밑줄이나 배경 채움은 쓰지 않는다 — 색만으로 구분한다.

## 반응형

| 이름 | 폭 | 주요 변화 |
|---|---|---|
| Mobile | < 640px | 달력은 **월간 그리드를 유지**하되 셀 내용은 카테고리 점만 남긴다. 셀을 탭하면 하단 시트로 그날 상세(항목명 + 금액)를 연다. 지출 목록은 1열. 대시보드 총액 카드는 폭 전체, 차트와 목록은 세로로 쌓인다. 좌우 여백 16px. |
| Tablet | 640–1024px | 달력 셀에 점 + 항목명 1개까지 표시하고 나머지는 `+N건`. 목록은 1열 유지. 대시보드 차트와 예정 목록이 2열로 나뉜다. |
| Desktop | 1024–1280px | 달력 셀에 항목 최대 3개 + 그날 합계 전부 표시. 컨테이너 1120px. 대시보드 2열. |
| Wide | > 1280px | 컨테이너는 1120px 에서 멈추고 남는 폭은 좌우 여백이 흡수한다. 달력 칸을 더 넓히지 않는다. |

**달력을 리스트로 바꾸지 않는 이유:** 사용자가 원한 건 "언제 빠져나가는지"를 **시각적으로**
파악하는 것이다. 모바일에서 그리드를 리스트로 접으면 그 목적이 사라진다. 그래서 그리드는
지키고 셀 안의 정보 밀도만 낮춘다.

### 터치 타겟

- 버튼과 입력은 40px 높이. 모바일에서는 좌우 패딩을 늘려 실제 터치 영역을 44px 이상으로 만든다.
- 달력 셀은 모바일에서 최소 44×44px. 1120px 그리드가 아니어도 7열은 유지되므로
  320px 화면에서 한 칸이 약 44px 이다.
- 목록 행 전체가 탭 영역이다. 행 안의 뱃지는 탭 대상이 아니다.

## 아직 정하지 않은 것

- **다크모드 실제 값:** 구조(CSS 변수)만 잡아두었고 어두운 팔레트의 실제 hex 는 정하지 않았다.
  특히 `{colors.primary}` 계열은 어두운 배경에서 대비가 반전되므로 재계산이 필요하다.
- **hover 상태 세부:** `{component.button-primary-hover}` 와 드롭다운 항목 hover 외에는
  정의하지 않았다. 목록 행·카드의 hover 는 구현하면서 정한다.
- **로딩 / 스켈레톤:** Server Component 로 데이터를 가져오므로 로딩 UI 가 필요한 지점이
  어디인지부터 확인해야 한다.
- **차트 라이브러리:** 도넛의 색과 범례 규칙만 정했고, 어떤 라이브러리로 그릴지
  (Recharts / 직접 SVG)는 미정이다.
- **토스트 / 알림:** 저장·삭제 피드백의 표시 방식과 위치를 정하지 않았다.
  `{colors.success}` 와 `{colors.danger}` 토큰만 준비되어 있다.
