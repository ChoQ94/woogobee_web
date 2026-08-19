import { NextResponse, type NextRequest } from "next/server";

/**
 * 보호 경로에 대한 **낙관적(optimistic) 로그인 검사**.
 *
 * ⚠️ 이건 진짜 방어선이 아니다. 세션 쿠키가 "있는지"만 보고, 그 쿠키가 유효한지·
 * 만료됐는지·어떤 사용자 것인지는 확인하지 않는다. 위조한 쿠키 하나면 통과한다.
 * 실제 방어는 각 페이지와 서버 액션 첫 줄의 `await auth()` 가 한다
 * (PROJECT.md 함정 7.1 참고).
 *
 * 그럼 왜 두는가 — 비로그인 사용자가 `/dashboard` 를 열었을 때 서버 렌더링과
 * DB 조회까지 간 다음 리다이렉트되는 대신, 요청 초입에서 되돌려 보내기 위해서다.
 *
 * Next 공식 문서가 proxy 를 완전한 세션 관리 수단으로 쓰지 말라고 명시하므로
 * 여기서 Prisma 나 `auth()` 를 호출하지 않는다. proxy 는 앱 런타임 바깥(CDN 등)에서
 * 실행될 수 있어 DB 커넥션을 들고 있으면 안 된다.
 *
 * 파일 이름 주의: Next 16 에서 `middleware` 규약은 deprecated 되고 `proxy` 로 바뀌었다.
 * export 이름도 `middleware` 가 아니라 `proxy` 다.
 */

// Auth.js 세션 쿠키 이름. HTTPS(프로덕션)에서는 `__Secure-` 접두사가 붙는다.
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export function proxy(request: NextRequest) {
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) =>
    request.cookies.has(name),
  );

  if (hasSessionCookie) return NextResponse.next();

  const landing = new URL("/", request.nextUrl);
  return NextResponse.redirect(landing);
}

export const config = {
  // 보호 경로만 잡는다. `/api/auth`(로그인 흐름 자체), `_next/static`, `_next/image`,
  // `public/` 정적 파일은 이 패턴에 걸리지 않으므로 별도 제외가 필요 없다.
  //
  // 경로를 새로 만들 때마다 여기에 추가해야 한다. 빠뜨려도 보안 구멍은 아니다 —
  // 각 페이지 첫 줄의 `auth()` 가 실제로 막는다. 다만 비로그인 방문자가
  // 서버 렌더와 DB 조회까지 갔다가 튕기므로 그만큼 느려진다.
  matcher: [
    "/dashboard/:path*",
    "/calendar/:path*",
    "/expenses/:path*",
    "/categories/:path*",
  ],
};
