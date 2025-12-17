"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("注文をキャンセルしますか？\n\nこの操作は取り消せません。キャンセルすると、在庫が元に戻ります。")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "キャンセルに失敗しました");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="destructive"
        className="w-full"
        disabled={isLoading}
        onClick={handleCancel}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        注文をキャンセル
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
