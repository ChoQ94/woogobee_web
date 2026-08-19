// Auth.js 가 만들어 준 라우트 핸들러를 그대로 노출한다.
// `/api/auth/signin`, `/api/auth/callback/google`, `/api/auth/signout` 등이 전부 여기로 들어온다.
// 로직은 `src/auth.ts` 에만 있고 이 파일은 배선(wiring)일 뿐이다.
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
