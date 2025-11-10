import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "リトミック研究センター - オンライン学習プラットフォーム",
  description: "リトミック指導者資格取得のためのオンライン学習システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
