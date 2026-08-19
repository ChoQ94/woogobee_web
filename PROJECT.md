# NEEDS — 고정지출 관리 플랫폼

> 새 세션이 이 파일만 읽어도 지금까지의 흐름과 다음 할 일을 알 수 있도록 유지한다.
> 결정이 바뀌거나 단계가 끝나면 이 문서를 먼저 갱신한다.
>
> 최초 작성: 2026-08-19

## 1. 무엇을 만드는가

구글 SSO로 로그인해서 **자기 한 달 고정지출을 등록하고 파악하는** 웹 서비스.

사용자가 원하는 것은 두 가지다.

1. **한 달에 총 얼마가 나가는지** 파악 — 월세, 보험료, 구독료 등을 모두 등록
2. **언제 빠져나가는지** 파악 — 달력에서 결제일을 시각적으로 확인

## 2. 확정된 결정과 그 이유

기술적 선택보다 **왜 그렇게 정했는지**가 중요하다. 되돌리려면 이유부터 확인할 것.

### 총액은 "이번 달 실제 결제액" 하나만 보여준다

연납 항목(예: 자동차보험 60만원)을 12로 나눠 분산하는 "월 평균 부담액"도
제안했으나, 사용자가 **단순하게 실제 결제액만** 원했다.

→ 연납은 결제되는 달에 전액이 잡힌다. 그 달만 총액이 튀는 게 정상이다.
목록에 `연납` 뱃지를 붙여 사용자가 이유를 알 수 있게 한다.

### 카테고리는 사용자가 직접 만든다

고정 enum 이 아니라 별도 테이블(`Category`)이다. 사용자마다 자기 카테고리를 가진다.

- 신규 가입 시 기본 카테고리를 시드한다 (주거·보험·구독·통신·기타).
  빈 화면에서 "카테고리부터 만드세요"는 막막하다.
- 색은 `design.md` 의 **8색 팔레트에서만** 고를 수 있다.
  자유 선택을 허용하면 달력에서 대비가 무너진다.

### 결제일이 그 달에 없으면 마지막 날로 당긴다

`paymentDay = 31` 인데 2월이면 → 2월 28일(윤년 29일)에 표시한다.
실제 카드사·은행의 관행과 같다. 달력을 만들면 반드시 마주치는 문제다.

### 해지한 항목은 삭제하지 않는다

`Expense.endedAt` 에 시점을 기록하고 화면에서만 숨긴다.
삭제해 버리면 "작년 3월엔 얼마 나갔지?"를 다시 볼 수 없다.

### 다크모드는 나중에

지금은 라이트만 구현한다. 단 색을 전부 CSS 변수로 선언해서
나중에 값만 교체하면 되도록 구조를 잡는다. 하드코딩된 색상값 금지.

## 3. 기술 스택

| 영역       | 선택                       | 버전   | 왜                                                 |
| ---------- | -------------------------- | ------ | -------------------------------------------------- |
| 프레임워크 | Next.js (App Router)       | 16.3.1 | 자료가 압도적으로 많음. 특히 Auth.js 구글 SSO 조합 |
| 언어       | TypeScript                 | 5.x    |                                                    |
| UI         | React                      | 19.2.8 |                                                    |
| 스타일     | Tailwind CSS               | v4     | `@theme` CSS 기반. `tailwind.config.js` 없음       |
| DB         | Neon Postgres              | —      | 서버리스. 순수 Postgres 라 나중에 이전 가능        |
| ORM        | Prisma                     | 7.9.1  |                                                    |
| 인증       | Auth.js (NextAuth v5 beta) | —      | 인증 로직이 내 코드 안에 있어 이해·제어가 쉬움     |

### 왜 Supabase 가 아닌가

Supabase 풀스택도 후보였다. RLS 로 DB 레벨에서 유저별 격리를 강제할 수 있는 건
분명한 장점이다. 그러나 **학습 목적**이 있어서 인증이 블랙박스가 되는 걸 피했고,
Supabase 전용 문법(RLS·Auth)에 묶이지 않는 쪽을 택했다.

**대신 RLS 가 막아주던 사고를 코드로 막아야 한다** — 아래 "함정" 참고.

### 백엔드는 따로 없다

Next.js 프로젝트 하나가 전부다.

| 하는 일        | 쓰는 것                                  |
| -------------- | ---------------------------------------- |
| 지출 목록 조회 | Server Component 에서 `prisma` 직접 호출 |
| 추가·수정·삭제 | Server Action                            |
| 구글 로그인    | Auth.js 가 만드는 Route Handler          |

`app/api/` 는 Auth.js 용 말고는 당분간 필요 없다.

## 4. 데이터 모델

전체 정의는 `prisma/schema.prisma` 참고. 요점만:

```
User ─┬─ Account, Session, VerificationToken   (Auth.js 표준)
      ├─ Category  (사용자별 카테고리, 8색 팔레트 중 하나)
      └─ Expense   (고정지출 항목)

Expense.categoryId → Category  (onDelete: SetNull)
```

`Expense` 주요 필드:

| 필드           | 설명                                                         |
| -------------- | ------------------------------------------------------------ |
| `amount`       | **원 단위 Int.** 부동소수점 오차를 피하려고 Float 을 안 쓴다 |
| `cycle`        | `MONTHLY` \| `YEARLY`                                        |
| `paymentDay`   | 1~31. 없는 날이면 그 달 마지막 날로 당김                     |
| `paymentMonth` | 연납일 때만 사용 (1~12)                                      |
| `endedAt`      | 해지 시점. `null` 이면 진행 중                               |

## 5. 진행 상태

- [x] **1단계 — 프로젝트 셋업** ✅ 완료
  - Next.js + TS + Tailwind v4 스캐폴드
  - Prisma 7 + pg 어댑터 설정, Neon 연결 확인
  - 스키마 작성 및 마이그레이션 적용 (테이블 6개 생성 확인)
  - `src/lib/prisma.ts` 싱글턴
  - `.env` / `.env.example` 구성, `AUTH_SECRET` 생성
  - `design.md` 작성
- [x] **2단계 — 구글 로그인** 🟡 코드 완성 · 구글 자격증명 대기
  - `src/auth.ts` (인증 로직 단일 진입점), `src/app/api/auth/[...nextauth]/route.ts`
  - `src/proxy.ts` — 보호 경로 낙관적 차단 (Next 16 이라 `middleware.ts` 아님, 함정 7.7)
  - 랜딩(`/`) 로그인 버튼, `/dashboard` 자리표시자 + 로그아웃
  - `src/lib/categories.ts` — 가입 시 기본 카테고리 5개 시드 (`events.createUser`)
  - `tsc --noEmit` / `lint` / `build` 통과, `/dashboard` 비로그인 차단 실제 확인
  - **남은 것: 구글 자격증명을 받아 로그인 왕복을 실제로 돌려보는 것뿐** (8번)
- [ ] **3단계 — 지출 CRUD** ← 다음
- [ ] **4단계 — 대시보드**
- [ ] **5단계 — 달력**

## 6. 다음 할 일

### 2단계 확인 (자격증명 받은 직후)

`npm run dev` 로 띄우고 아래를 순서대로 확인한다.

1. `/` 에서 "Google 로 계속하기" → 로그인 → `/dashboard` 로 이동, 이름·이메일 표시
2. 로그아웃 → `/` 로 복귀
3. 비로그인 상태로 `/dashboard` 직접 접근 → `/` 로 차단 (이건 이미 확인됨)
4. `npx prisma studio` 에서 `User` 1건, `Session` 1건, **`Category` 5건** 확인
5. 재로그인해도 카테고리가 10건으로 늘어나지 않을 것 (`events.createUser` 는 가입 때만)

### 3단계 — 지출 CRUD

- `src/lib/expenses.ts` 에 데이터 접근 코드를 **전부 모은다** (함정 6.1 참고)
- 추가·수정·삭제 Server Action
- 목록 화면
- 카테고리 관리 (추가·수정·삭제, 8색 팔레트에서 색 선택)

### 4단계 — 대시보드

- 이번 달 총 결제액 (`display` 스케일, `tabular-nums`)
- 카테고리별 비중 (도넛 또는 바)
- 이번 달 결제 예정 목록

### 5단계 — 달력

- 월간 뷰, 앞뒤 달 이동
- 날짜 칸에 카테고리 dot + 항목명, 3개 초과 시 `+N건`
- 칸 하단에 그날 합계
- **31일 처리**와 **연납 항목** 반영
- 오늘 날짜 강조

## 7. 함정 모음

작업 전에 반드시 읽을 것.

### 7.1 모든 Server Action 은 첫 줄에서 인증·소유권을 확인한다 ⚠️ 최우선

Server Action 은 평범한 함수처럼 생겼지만 **실제로는 공개 HTTP 엔드포인트다.**
Next.js 가 자동으로 엔드포인트를 만들어 연결한다. 누구나 직접 호출할 수 있다.

```ts
// ❌ 남의 지출 ID 만 알면 삭제된다
"use server";
export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
}

// ✅ 인증 + 소유권 확인
("use server");
export async function deleteExpense(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.expense.deleteMany({ where: { id, userId: session.user.id } });
}
```

Supabase RLS 를 안 쓰기로 했으므로 **이 확인이 유일한 방어선이다.**
그래서 데이터 접근 코드를 `src/lib/expenses.ts` 한 군데로 모은다.
화면 여기저기에 `prisma` 호출을 흩뿌리면 언젠가 `userId` 필터를 빠뜨린다.

### 7.2 Prisma 7 은 설정 방식이 다르다

검색하면 나오는 자료 대부분이 Prisma 6 이하 기준이라 그대로 하면 안 된다.

- `schema.prisma` 의 `datasource` 에 **`url` 을 쓸 수 없다.**
  → `prisma.config.ts` 에서 지정한다
- `PrismaClient` 에 **드라이버 어댑터를 넘겨야 한다.**
  → `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`
- `.env` 를 자동으로 읽지 않는다 → `prisma.config.ts` 상단에 `import "dotenv/config"`

### 7.3 카테고리 삭제가 지출을 지우면 안 된다

`Expense.categoryId` 는 `onDelete: SetNull` 이다. 기본값인 `Cascade` 로 바꾸면
"구독" 카테고리를 지웠을 때 넷플릭스·유튜브 지출이 통째로 사라진다.
카테고리가 없는 지출은 "미분류"(`slate` 색)로 표시한다.

### 7.4 금액 표시에는 항상 `tabular-nums`

숫자 폭이 제각각이라 금액 목록의 자릿수가 어긋나 보인다.
`design.md` 4번 항목 참고. 축약 표기(`124만원`)도 쓰지 않는다.

### 7.5 Tailwind v4 는 설정 파일이 없다

`tailwind.config.js` 를 만들지 말 것. 토큰은 `src/app/globals.css` 의
`@theme` 블록에 선언한다.

### 7.6 Prisma 클라이언트는 반드시 싱글턴으로

`src/lib/prisma.ts` 를 통해서만 import 한다. 개발 서버가 핫 리로드할 때마다
새 인스턴스를 만들면 Neon 커넥션 한도에 금방 걸린다.

### 7.7 Next 16 은 `middleware.ts` 가 아니라 `proxy.ts` 다

Next 16 에서 `middleware` 규약이 deprecated 되고 `proxy` 로 이름이 바뀌었다.
export 이름도 `middleware` 가 아니라 `proxy` 이고, Node.js 런타임이 기본이라
`export const runtime = ...` 을 쓰면 **에러가 난다.**
검색 결과 대부분이 `middleware.ts` 기준이므로 그대로 따라 하면 안 된다.
근거: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`

그리고 proxy 는 **낙관적 검사 전용**이다. 쿠키가 있는지만 본다.
진짜 방어선은 언제나 페이지·서버 액션 첫 줄의 `await auth()` 다 (함정 7.1).

### 7.8 배포할 때 `AUTH_URL` 이 필요하다

Auth.js v5 는 개발 모드에서만 호스트를 자동으로 신뢰한다. 프로덕션 빌드를
Vercel 이 아닌 곳에서 돌리면 `UntrustedHost` 로 로그인이 전부 실패한다.
그때 `.env` 에 `AUTH_URL="https://실제도메인"` 을 넣으면 된다.
로컬 개발에는 필요 없다.

## 8. 사용자 액션 대기 중

### 🔴 필수 — 구글 OAuth 자격증명 (2단계 마무리 차단 중)

프로젝트를 `woogobee/` 하위로 옮기면서 `.env` 가 상위 폴더에 남아 있었다.
지금은 `woogobee/.env` 로 옮겨두었다 — **편집할 파일은 프로젝트 루트의 `.env` 다.**

그 안의 아래 두 줄이 비어 있다.

```
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

[Google Cloud Console](https://console.cloud.google.com) → APIs & Services →
Credentials → OAuth 2.0 Client ID(웹 애플리케이션)에서 발급.

**리디렉션 URI 에 `http://localhost:3000/api/auth/callback/google` 을 반드시 등록**할 것.
빠뜨리면 로그인 시 `redirect_uri_mismatch` 에러가 난다.

쿼리스트링(`?sslmode=verify-full&channel_binding=require`)은 그대로 둔다.
`verify-full` 은 서버 인증서까지 검증하는 설정으로, Neon 이 기본 제공하는
`sslmode=require`(암호화만 하고 인증서 검증 안 함)보다 안전해서 바꿔놓은 것이다.

## 9. 참고 파일

| 파일                   | 내용                                          |
| ---------------------- | --------------------------------------------- |
| `design.md`            | 색·타이포·간격·컴포넌트 규칙. UI 작업 전 필독 |
| `prisma/schema.prisma` | 데이터 모델                                   |
| `prisma.config.ts`     | Prisma 7 설정 (DB 주소)                       |
| `src/lib/prisma.ts`    | Prisma 클라이언트 싱글턴                      |
| `.env.example`         | 필요한 환경변수 목록                          |
| `AGENTS.md`            | Next.js 가 자동 생성하는 규칙. 건드리지 말 것 |
