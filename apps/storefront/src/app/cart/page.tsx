import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth/session";
import { CartContent } from "./cart-content";

export default async function CartPage(): Promise<ReactElement> {
  // Redirect to login if not authenticated
  if (!(await isAuthenticated())) {
    redirect("/login?redirect=/cart");
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold tracking-tight mb-8">ショッピングカート</h1>
      <CartContent />
    </div>
  );
}
