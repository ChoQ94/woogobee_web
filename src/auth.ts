/**
 * 인증 로직의 유일한 진입점.
 *
 * 로그인·세션·가입 시 부수효과(기본 카테고리 시드)가 전부 이 파일 안에 있다.
 * 화면과 서버 액션은 여기서 내보내는 `auth` / `signIn` / `signOut` 만 쓰고,
 * OAuth 흐름 자체를 알지 못한다.
 *
 * 이 경계를 지켜야 하는 구체적인 이유가 하나 있다.
 * 나중에 이 서비스를 웹뷰앱으로 감싸면 구글이 임베디드 웹뷰에서의 OAuth 를
 * 차단하기 때문에(`disallowed_useragent`) 앱 안에서 로그인 화면을 그대로 띄울 수 없다.
 * 외부 브라우저(Android Custom Tabs / iOS SFSafariViewController)로 인증을 넘기고
 * 딥링크로 돌아오는 흐름을 덧붙여야 한다.
 * 그 변경은 provider 설정과 redirect 콜백 조정으로 **이 파일 안에서 끝나야 한다.**
 * 페이지나 서버 액션이 인증 절차를 직접 알기 시작하면 그때 손댈 곳이 열 군데로 늘어난다.
 */
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { seedDefaultCategories } from "@/lib/seed";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],

  // 어댑터 기본값인 데이터베이스 세션을 쓴다.
  // 세션 레코드가 DB 에 있어야 서버에서 즉시 무효화할 수 있고,
  // JWT 와 달리 사용자 정보가 항상 DB 의 최신 상태와 일치한다.
  session: { strategy: "database" },

  callbacks: {
    session({ session, user }) {
      // 데이터베이스 세션에서는 `user` 가 항상 채워져 들어온다.
      // 3단계부터의 모든 소유권 검사(`where: { userId }`)가 이 값 하나에 의존하므로
      // 여기서 반드시 채워 넣는다. 타입은 `src/types/next-auth.d.ts` 에서 확장했다.
      session.user.id = user.id;
      return session;
    },
  },

  events: {
    // 가입(= User 레코드 최초 생성) 시 한 번만 불린다. 로그인 때마다 불리지 않는다.
    async createUser({ user }) {
      if (!user.id) return;
      await seedDefaultCategories(user.id);
    },
  },
});
