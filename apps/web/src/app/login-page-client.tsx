"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const account = String(formData.get("account") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        const message = data?.error || "ログインに失敗しました";
        setError(message);
        return;
      }

      const redirect = searchParams.get("redirect");
      const target = redirect && redirect.startsWith("/") ? redirect : "/account";
      router.push(target);
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-10 shadow-[0_12px_40px_rgba(15,157,88,0.08)]">
        <div className="flex flex-col items-center text-center gap-3">
          <LogoMark />
          <div className="text-xs text-[#6b7280]">特定非営利活動法人</div>
          <div className="text-lg font-semibold text-[#111827]">リトミック研究センター</div>
          <div className="text-sm font-medium text-[#111827]">基幹システム</div>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div className="space-y-2 text-left">
            <Label htmlFor="account" className="text-sm font-medium text-[#374151]">
              アカウント
            </Label>
            <Input
              id="account"
              name="account"
              placeholder="example"
              className="h-11 border-[#d1d5db] focus-visible:ring-[#0f9d58]"
            />
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="password" className="text-sm font-medium text-[#374151]">
              パスワード
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="example"
              className="h-11 border-[#d1d5db] focus-visible:ring-[#0f9d58]"
            />
          </div>
          <div className="flex items-center gap-2 text-left">
            <Checkbox
              id="remember"
              defaultChecked
              className="data-[state=checked]:bg-[#0f9d58] data-[state=checked]:border-[#0f9d58]"
            />
            <label htmlFor="remember" className="text-sm text-[#4b5563]">
              パスワードを記憶する
            </label>
          </div>
          {error && (
            <p className="text-sm text-red-600 text-left">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full h-11 rounded-md bg-[#0f9d58] text-white text-sm font-semibold hover:bg-[#0c7a45] disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#0f9d58]/30 bg-white">
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.9999 4C16.546 4 18.6646 6.11857 18.6646 8.66467C18.6646 11.2108 16.546 13.3293 13.9999 13.3293C11.4538 13.3293 9.33521 11.2108 9.33521 8.66467C9.33521 6.11857 11.4538 4 13.9999 4Z"
            fill="#0f9d58"
          />
          <path
            d="M14 14.6667C18.6024 14.6667 22.3334 18.3976 22.3334 23.0001H5.66669C5.66669 18.3976 9.3976 14.6667 14 14.6667Z"
            fill="#43b77d"
          />
        </svg>
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="text-sm font-semibold tracking-tight text-[#0f9d58]">リト研</span>
        <span className="text-xs text-[#6b7280]">管理システム</span>
      </div>
    </div>
  );
}
