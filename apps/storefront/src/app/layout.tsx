import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/lib/cart/context";
import { StoreSettingsProvider } from "@/lib/store-settings-context";
import { getCurrentUser } from "@/lib/auth/session";
import { getStoreSettings, DEFAULT_STORE_SETTINGS } from "@/lib/store-settings";
import "./globals.css";

export const metadata: Metadata = {
  title: "社内ストア",
  description: "社内向け教材・商品販売サイト",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps): Promise<ReactElement> {
  const user = await getCurrentUser();
  const storeSettings = await getStoreSettings() ?? DEFAULT_STORE_SETTINGS;

  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col antialiased">
        <StoreSettingsProvider initialSettings={storeSettings}>
          <CartProvider>
            <Header user={user} />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </StoreSettingsProvider>
      </body>
    </html>
  );
}
