import { BottomNav } from "@/app/(app)/bottom-nav";

/* ---------------------------------------------------------------------------
 * 로그인 후 화면들의 공통 껍데기 — 하단 탭 바를 여기 한 번만 붙인다.
 * 랜딩(`/`)은 이 그룹 밖이라 바가 나오지 않는다 (design.md {components.bottom-nav}).
 *
 * 여기서 auth() 를 부르지 않는다. 각 페이지가 이미 첫 줄에서 확인하고 있고,
 * 방어선을 두 군데로 늘리면 어느 쪽이 진짜인지 흐려진다 (PROJECT.md §7.1).
 * ------------------------------------------------------------------------- */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* 바가 콘텐츠를 덮으므로 바 높이 + 홈 인디케이터만큼 아래 여백을 준다. */}
      <div className="pb-bottom-nav-safe">{children}</div>
      <BottomNav />
    </>
  );
}
