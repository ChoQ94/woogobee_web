import type { DefaultSession } from "next-auth";

/**
 * `session.user.id` 를 필수 문자열로 좁힌다.
 *
 * `src/auth.ts` 의 session 콜백이 항상 채워 넣으므로 실제로 optional 이 아니고,
 * 소유권 검사에서 `session.user.id!` 같은 단언을 쓰지 않으려면 타입도 그렇게 말해야 한다.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
