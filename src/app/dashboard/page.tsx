import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  // proxy 의 쿠키 검사는 낙관적일 뿐이므로 여기서 다시 확인한다.
  // 이 한 줄이 실제 방어선이다 (PROJECT.md 함정 7.1).
  const session = await auth();
  if (!session?.user) redirect("/");

  const { name, email } = session.user;

  return (
    <main className="min-h-dvh bg-canvas text-ink">
      <div className="mx-auto max-w-narrow px-5 py-8">
        <h1 className="text-title">대시보드</h1>

        {/* design.md {component.card} — 흰 면 + hairline 1px + 12px + 안여백 20px */}
        <div className="mt-6 rounded-lg border border-hairline bg-surface-card p-5">
          <p className="text-caption text-muted">로그인 계정</p>
          <p className="mt-2 text-body-strong">{name ?? "이름 없음"}</p>
          <p className="text-muted">{email}</p>
        </div>

        <p className="mt-6 text-muted">
          이번 달 결제 예정 금액과 달력은 다음 단계에서 붙입니다.
        </p>

        <form
          className="mt-8"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          {/* design.md {component.button-secondary} */}
          <button
            type="submit"
            className="h-10 rounded-md border border-hairline bg-canvas px-4 text-button text-ink transition-colors hover:bg-surface-soft"
          >
            로그아웃
          </button>
        </form>
      </div>
    </main>
  );
}
