import type { Metadata } from "next";

// Pretendard 는 Google Fonts 에 없어서 next/font/google 로 가져올 수 없다.
// npm 패키지의 가변(variable) 동적 서브셋 CSS 를 그대로 읽는다.
// 동적 서브셋이라 한글 글리프를 통째로 받지 않고 쓰는 만큼만 내려받는다.
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEEDS — 고정지출 관리",
  description:
    "매달 빠져나가는 고정지출을 한 곳에 모아, 이번 달에 얼마가 언제 나가는지 확인합니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full font-sans antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
