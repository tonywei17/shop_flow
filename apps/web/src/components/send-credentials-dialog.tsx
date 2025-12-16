"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Mail, AlertCircle } from "lucide-react";

type SendResult = {
  accountId: string;
  email: string | null;
  success: boolean;
  error?: string;
};

type SendCredentialsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "all" | "selected";
  selectedCount: number;
  selectedIds: string[];
  onConfirm: () => Promise<{
    ok: boolean;
    message?: string;
    results?: SendResult[];
    successCount?: number;
    failCount?: number;
  }>;
};

type DialogState = "preview" | "sending" | "complete";

export function SendCredentialsDialog({
  open,
  onOpenChange,
  mode,
  selectedCount,
  selectedIds,
  onConfirm,
}: SendCredentialsDialogProps) {
  const [state, setState] = React.useState<DialogState>("preview");
  const [progress, setProgress] = React.useState(0);
  const [results, setResults] = React.useState<SendResult[]>([]);
  const [successCount, setSuccessCount] = React.useState(0);
  const [failCount, setFailCount] = React.useState(0);
  const [message, setMessage] = React.useState("");

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setState("preview");
      setProgress(0);
      setResults([]);
      setSuccessCount(0);
      setFailCount(0);
      setMessage("");
    }
  }, [open]);

  const handleConfirm = async () => {
    setState("sending");
    setProgress(10);

    // Simulate progress while waiting for API
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 200);

    try {
      const result = await onConfirm();
      clearInterval(progressInterval);
      setProgress(100);

      if (result.ok) {
        setResults(result.results || []);
        setSuccessCount(result.successCount || 0);
        setFailCount(result.failCount || 0);
        setMessage(result.message || "送信が完了しました");
      } else {
        setMessage(result.message || "送信に失敗しました");
      }

      setState("complete");
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(100);
      setMessage(error instanceof Error ? error.message : "送信に失敗しました");
      setState("complete");
    }
  };

  const failedResults = results.filter((r) => !r.success);

  const targetDescription = mode === "all" 
    ? "全てのアカウント" 
    : `選択中の ${selectedCount} 件のアカウント`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {state === "preview" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                ログイン情報の送信確認
              </DialogTitle>
              <DialogDescription>
                {targetDescription}にログイン情報をメール送信します。
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <h4 className="mb-3 font-medium text-sm">メール内容プレビュー</h4>
                <div className="rounded-lg border bg-background p-4 text-sm">
                  <div className="mb-4 border-b pb-3">
                    <div className="text-muted-foreground text-xs mb-1">件名</div>
                    <div className="font-medium">【社内ストア】アカウント情報のお知らせ</div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">[氏名] 様</p>
                    <p>社内ストアのアカウント情報をお知らせいたします。</p>
                    <div className="rounded bg-muted/50 p-3 space-y-2">
                      <div>
                        <span className="text-xs text-muted-foreground">アカウントID：</span>
                        <span className="font-mono ml-2">[account_id]</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">パスワード：</span>
                        <span className="font-mono ml-2">[password]</span>
                      </div>
                    </div>
                    <p>以下のボタンからログインページにアクセスできます。</p>
                    <div className="pt-2">
                      <span className="inline-block bg-emerald-500 text-white px-4 py-2 rounded text-sm">
                        ログインページへ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  メールアドレスが登録されていないアカウントには送信されません。
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button onClick={handleConfirm}>
                送信する
              </Button>
            </DialogFooter>
          </>
        )}

        {state === "sending" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 animate-pulse" />
                メール送信中...
              </DialogTitle>
              <DialogDescription>
                {targetDescription}にメールを送信しています。しばらくお待ちください。
              </DialogDescription>
            </DialogHeader>

            <div className="py-8 space-y-4">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {progress}% 完了
              </p>
            </div>
          </>
        )}

        {state === "complete" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {failCount === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                送信完了
              </DialogTitle>
              <DialogDescription>{message}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{successCount}</div>
                  <div className="text-sm text-muted-foreground">成功</div>
                </div>
                <div className="flex-1 rounded-lg border bg-red-50 dark:bg-red-950/30 p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{failCount}</div>
                  <div className="text-sm text-muted-foreground">失敗</div>
                </div>
              </div>

              {failedResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    送信失敗したアカウント
                  </h4>
                  <ScrollArea className="h-[200px] rounded-lg border">
                    <div className="p-3 space-y-2">
                      {failedResults.map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded bg-muted/50 p-2 text-sm"
                        >
                          <div>
                            <span className="font-mono">{result.accountId}</span>
                            {result.email && (
                              <span className="text-muted-foreground ml-2">
                                ({result.email})
                              </span>
                            )}
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {result.error || "送信失敗"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>閉じる</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
