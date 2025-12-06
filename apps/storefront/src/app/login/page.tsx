import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export default async function LoginPage(): Promise<ReactElement> {
  // Redirect if already logged in
  if (await isAuthenticated()) {
    redirect("/");
  }

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">ログイン</h1>
          <p className="text-muted-foreground">
            アカウントIDとパスワードを入力してください
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
