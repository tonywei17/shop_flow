import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md rounded-2xl bg-white px-8 py-12 shadow-[0_16px_48px_rgba(15,157,88,0.08)]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#0f9d58]/30 bg-white">
          <span className="text-2xl font-semibold text-[#0f9d58]">404</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#111827]">お探しのページが見つかりません</h1>
        <p className="mt-3 text-sm leading-6 text-[#4b5563]">
          URL が正しいかご確認いただくか、トップページへ戻ってください。
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild className="w-full bg-[#0f9d58] text-white hover:bg-[#0c7a45]">
            <Link href="/">ログインページへ戻る</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/commerce">ダッシュボードへ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
