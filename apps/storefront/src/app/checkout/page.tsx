import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/lib/auth/session";
import { CheckoutContent } from "./checkout-content";

export default async function CheckoutPage(): Promise<ReactElement> {
  // Redirect to login if not authenticated
  if (!(await isAuthenticated())) {
    redirect("/login?redirect=/checkout");
  }

  const user = await getCurrentUser();

  return (
    <div className="container px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold tracking-tight mb-8">ご注文手続き</h1>
      <CheckoutContent user={user} />
    </div>
  );
}
