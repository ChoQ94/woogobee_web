import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  // proxy 의 쿠키 검사는 낙관적일 뿐이므로 여기서 다시 확인한다.
  // 이 한 줄이 실제 방어선이다 (PROJECT.md 함정 7.1).
  const session = await auth();
  if (!session?.user) redirect("/");

  const { name, email } = session.user;

  return (
    <main className="min-h-dvh bg-white text-[#0F172A]">
      <div className="mx-auto max-w-[480px] px-5 py-8">
        <h1 className="text-[24px] font-semibold leading-[1.3] tracking-[-0.01em]">
          대시보드
        </h1>

        <div className="mt-6 rounded-[12px] border border-[#E2E8F0] p-5">
          <p className="text-[13px] leading-[1.4] text-[#64748B]">로그인 계정</p>
          <p className="mt-2 text-[15px] font-semibold leading-[1.6]">
            {name ?? "이름 없음"}
          </p>
          <p className="text-[15px] leading-[1.6] text-[#64748B]">{email}</p>
        </div>

        <p className="mt-6 text-[15px] leading-[1.6] text-[#64748B]">
          이번 달 결제 예정 금액과 달력은 다음 단계에서 붙입니다.
        </p>

        <form
          className="mt-8"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="h-10 rounded-[8px] border border-[#E2E8F0] bg-white px-4 text-[15px] font-medium leading-[1.2] text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
          >
            로그아웃
          </button>
        </form>
      </div>
    </main>
  );
}
