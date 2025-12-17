"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { AccountItem } from "./expenses-client";

type ImportExpenseDialogProps = {
  accountItems: AccountItem[];
  onImportComplete: () => void;
};

type ImportStatus = "idle" | "uploading" | "processing" | "completed" | "error";

type ImportResult = {
  total: number;
  success: number;
  failed: number;
  errors: string[];
};

export function ImportExpenseDialog({ accountItems, onImportComplete }: ImportExpenseDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<ImportStatus>("idle");
  const [progress, setProgress] = React.useState(0);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStatus("idle");
    setProgress(0);
    setSelectedFile(null);
    setResult(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error("xlsx または csv ファイルを選択してください");
      return;
    }

    setSelectedFile(file);
    setResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("ファイルを選択してください");
      return;
    }

    setStatus("uploading");
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      setProgress(30);
      setStatus("processing");

      const response = await fetch("/api/expenses/import", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "インポートに失敗しました");
      }

      setProgress(100);
      setStatus("completed");
      setResult({
        total: data.total || 0,
        success: data.successCount || 0,
        failed: data.failed || 0,
        errors: data.errors || [],
      });

      if (data.successCount > 0) {
        toast.success(`${data.successCount} 件のデータをインポートしました`);
        onImportComplete();
      }
    } catch (error) {
      setStatus("error");
      setResult({
        total: 0,
        success: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : "エラーが発生しました"],
      });
      toast.error(error instanceof Error ? error.message : "インポートに失敗しました");
    }
  };

  const handleClose = () => {
    resetState();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetState();
      setOpen(isOpen);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          インポート
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>費用データインポート</DialogTitle>
          <DialogDescription>
            xlsx または csv ファイルから費用データを一括インポートします。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Format Info */}
          <div className="rounded-lg border bg-muted/50 p-4 text-sm">
            <p className="font-medium mb-2">対応フォーマット</p>
            <p className="text-muted-foreground mb-2">
              以下の列を含む xlsx または csv ファイル:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>店番</li>
              <li>店名</li>
              <li>費用発生日</li>
              <li>勘定項目</li>
              <li>項目名</li>
              <li>費用タイプ</li>
              <li>請求金額</li>
              <li>審査者アカウントID（任意）</li>
            </ul>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <Label>ファイル選択</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={status === "uploading" || status === "processing"}
              >
                <FileSpreadsheet className="h-4 w-4" />
                {selectedFile ? selectedFile.name : "ファイルを選択..."}
              </Button>
            </div>
          </div>

          {/* Progress */}
          {(status === "uploading" || status === "processing") && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {status === "uploading" ? "アップロード中..." : "処理中..."}
              </p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-lg border p-4 ${status === "completed" && result.failed === 0 ? "bg-green-50 border-green-200" : status === "error" || result.failed > 0 ? "bg-red-50 border-red-200" : ""}`}>
              {status === "completed" && result.failed === 0 ? (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">インポート完了</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">エラーが発生しました</span>
                </div>
              )}
              <div className="mt-2 text-sm">
                <p>総件数: {result.total}</p>
                <p className="text-green-600">成功: {result.success}</p>
                {result.failed > 0 && <p className="text-red-600">失敗: {result.failed}</p>}
              </div>
              {result.errors.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  <p className="font-medium">エラー詳細:</p>
                  <ul className="list-disc list-inside">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>...他 {result.errors.length - 5} 件</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            {status === "completed" ? "閉じる" : "キャンセル"}
          </Button>
          {status !== "completed" && (
            <Button
              onClick={handleImport}
              disabled={!selectedFile || status === "uploading" || status === "processing"}
            >
              {status === "uploading" || status === "processing" ? "処理中..." : "インポート開始"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
