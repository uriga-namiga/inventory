import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "재고관리 시스템",
  description: "간편한 재고관리 프로그램",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
