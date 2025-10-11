import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Storefront",
  description: "Medusa Storefront",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between" }}>
            <a href="/" style={{ fontWeight: 700 }}>Storefront</a>
            <nav style={{ display: "flex", gap: 12 }}>
              <a href="/">Home</a>
            </nav>
          </div>
        </header>
        <main style={{ maxWidth: 960, margin: "24px auto", padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
