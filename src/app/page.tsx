import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";

// 로그인 여부에 따라 화면이 달라지므로 정적 생성 대상이 아니다.
// `auth()` 가 쿠키를 읽으므로 Next 가 알아서 동적 렌더로 처리한다.
export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-dvh bg-white text-[#0F172A]">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center px-5">
        <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-0.02em]">
          NEEDS
        </h1>
        <p className="mt-3 text-[15px] leading-[1.6] text-[#64748B]">
          매달 빠져나가는 고정지출을 한 곳에 모아,
          <br />
          이번 달에 얼마가 언제 나가는지 확인합니다.
        </p>

        <form
          className="mt-8"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="h-10 w-full rounded-[8px] bg-[#6B4A8A] px-4 text-[15px] font-medium leading-[1.2] text-white transition-colors hover:bg-[#9878b7]"
          >
            Google 로 계속하기
          </button>
        </form>

        <p className="mt-4 text-[13px] leading-[1.4] text-[#94A3B8]">
          구글 계정으로 로그인합니다. 별도 회원가입은 없습니다.
        </p>
      </div>
    </main>
  );
}
