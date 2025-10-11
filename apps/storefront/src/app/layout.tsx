import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "社内ストア",
  description: "Medusa を利用した社内向けストア",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between" }}>
            <a href="/" style={{ fontWeight: 700 }}>社内ストア</a>
            <nav style={{ display: "flex", gap: 12 }}>
              <a href="/">トップ</a>
              <a href="/cart">カート</a>
              <a href="/account">マイページ</a>
            </nav>
          </div>
        </header>
        <main style={{ maxWidth: 960, margin: "24px auto", padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
