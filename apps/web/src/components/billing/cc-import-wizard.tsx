"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileInput } from "@/components/ui/file-input";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Users,
  Building2,
  CreditCard,
} from "lucide-react";

interface ImportStep {
  id: "child_count" | "aigran" | "bank_transfer";
  title: string;
  description: string;
  icon: React.ReactNode;
  fileHint: string;
  required: boolean;
}

interface StepStatus {
  status: "pending" | "uploading" | "success" | "error";
  file?: File;
  progress?: string;
  result?: {
    success_count: number;
    error_count: number;
    message?: string;
  };
}

const IMPORT_STEPS: ImportStep[] = [
  {
    id: "child_count",
    title: "① チャイルド数（全教室）",
    description: "全教室の会員数データをインポートします。これが基本データとなります。",
    icon: <Users className="h-5 w-5" />,
    fileHint: "例: 11月度チャイルド数.xlsx",
    required: true,
  },
  {
    id: "aigran",
    title: "② アイグラン（特約教室）",
    description: "アイグラン特約教室のデータで上書きします。該当教室の会員数が更新されます。",
    icon: <Building2 className="h-5 w-5" />,
    fileHint: "例: アイグラン11月度.xlsx",
    required: false,
  },
  {
    id: "bank_transfer",
    title: "③ 口座振替教室一覧",
    description: "口座振替済みの教室を請求対象から除外します。",
    icon: <CreditCard className="h-5 w-5" />,
    fileHint: "例: 11月 口座振替教室一覧.xlsx",
    required: false,
  },
];

interface CcImportWizardProps {
  billingMonth: string;
  onComplete?: () => void;
  onClose?: () => void;
}

export function CcImportWizard({ billingMonth, onComplete, onClose }: CcImportWizardProps) {
  const [stepStatuses, setStepStatuses] = React.useState<Record<string, StepStatus>>({
    child_count: { status: "pending" },
    aigran: { status: "pending" },
    bank_transfer: { status: "pending" },
  });

  const handleFileSelect = (stepId: string, file: File | null) => {
    if (!file) return;
    setStepStatuses((prev) => ({
      ...prev,
      [stepId]: { ...prev[stepId], file, status: "pending" },
    }));
  };

  const handleUpload = async (stepId: string) => {
    const stepStatus = stepStatuses[stepId];
    if (!stepStatus.file) return;

    const fileSize = stepStatus.file.size;
    const fileName = stepStatus.file.name;
    
    // Estimate rows based on file size (rough estimate)
    const estimatedRows = Math.round(fileSize / 50);

    setStepStatuses((prev) => ({
      ...prev,
      [stepId]: { 
        ...prev[stepId], 
        status: "uploading",
        progress: `ファイル読み込み中... (${fileName}, ${Math.round(fileSize / 1024)}KB)`,
      },
    }));

    try {
      // Update progress after a short delay
      setTimeout(() => {
        setStepStatuses((prev) => {
          if (prev[stepId].status !== "uploading") return prev;
          return {
            ...prev,
            [stepId]: { 
              ...prev[stepId], 
              progress: `データ解析中... 約${estimatedRows}行を処理します`,
            },
          };
        });
      }, 500);

      setTimeout(() => {
        setStepStatuses((prev) => {
          if (prev[stepId].status !== "uploading") return prev;
          return {
            ...prev,
            [stepId]: { 
              ...prev[stepId], 
              progress: `データベースに書き込み中...`,
            },
          };
        });
      }, 1500);

      const formData = new FormData();
      formData.append("file", stepStatus.file);
      formData.append("file_type", stepId);
      formData.append("billing_month", billingMonth);

      const response = await fetch("/api/cc-members/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStepStatuses((prev) => ({
          ...prev,
          [stepId]: {
            ...prev[stepId],
            status: "success",
            progress: undefined,
            result: {
              success_count: result.success_count,
              error_count: result.error_count,
            },
          },
        }));
      } else {
        setStepStatuses((prev) => ({
          ...prev,
          [stepId]: {
            ...prev[stepId],
            status: "error",
            progress: undefined,
            result: { success_count: 0, error_count: 0, message: result.error },
          },
        }));
      }
    } catch (error) {
      setStepStatuses((prev) => ({
        ...prev,
        [stepId]: {
          ...prev[stepId],
          status: "error",
          progress: undefined,
          result: { success_count: 0, error_count: 0, message: "アップロード中にエラーが発生しました" },
        },
      }));
    }
  };

  const handleReset = (stepId: string) => {
    setStepStatuses((prev) => ({
      ...prev,
      [stepId]: { status: "pending" },
    }));
  };

  const getStepIcon = (stepId: string) => {
    const status = stepStatuses[stepId].status;
    switch (status) {
      case "uploading":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const allRequiredComplete = IMPORT_STEPS.filter((s) => s.required).every(
    (s) => stepStatuses[s.id].status === "success"
  );

  const successCount = Object.values(stepStatuses).filter((s) => s.status === "success").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b">
        <h2 className="text-xl font-semibold">CC会員データ インポート</h2>
        <p className="text-sm text-muted-foreground mt-1">
          対象月: <span className="font-medium">{billingMonth}</span> ｜ 
          以下の順番でファイルをアップロードしてください
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {IMPORT_STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                stepStatuses[step.id].status === "success"
                  ? "bg-green-500 border-green-500 text-white"
                  : stepStatuses[step.id].status === "error"
                  ? "bg-red-500 border-red-500 text-white"
                  : stepStatuses[step.id].status === "uploading"
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-background border-muted-foreground/30"
              }`}
            >
              {stepStatuses[step.id].status === "uploading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : stepStatuses[step.id].status === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            {index < IMPORT_STEPS.length - 1 && (
              <div
                className={`w-12 h-0.5 ${
                  stepStatuses[step.id].status === "success" ? "bg-green-500" : "bg-muted-foreground/30"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {IMPORT_STEPS.map((step, index) => {
          const status = stepStatuses[step.id];
          const isDisabled = index > 0 && stepStatuses[IMPORT_STEPS[index - 1].id].status !== "success";

          return (
            <Card
              key={step.id}
              className={`transition-all ${
                status.status === "success"
                  ? "border-green-200 bg-green-50/50"
                  : status.status === "error"
                  ? "border-red-200 bg-red-50/50"
                  : isDisabled
                  ? "opacity-50"
                  : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        status.status === "success"
                          ? "bg-green-100 text-green-600"
                          : status.status === "error"
                          ? "bg-red-100 text-red-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {step.title}
                        {step.required && (
                          <Badge variant="destructive" className="text-xs">
                            必須
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">{step.description}</CardDescription>
                    </div>
                  </div>
                  {getStepIcon(step.id)}
                </div>
              </CardHeader>
              <CardContent>
                {status.status === "success" ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {status.result?.success_count}件 インポート完了
                        {status.result?.error_count ? ` (${status.result.error_count}件エラー)` : ""}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleReset(step.id)}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      やり直す
                    </Button>
                  </div>
                ) : status.status === "error" ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{status.result?.message || "エラーが発生しました"}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleReset(step.id)}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      やり直す
                    </Button>
                  </div>
                ) : status.status === "uploading" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-600">処理中...</p>
                        <p className="text-xs text-muted-foreground">{status.progress || "準備中..."}</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full animate-pulse" style={{ width: "60%" }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <FileInput
                        accept=".xlsx,.xls,.csv"
                        disabled={isDisabled}
                        selectedFile={status.file || null}
                        onFileSelect={(file) => handleFileSelect(step.id, file)}
                        buttonText="ファイルを選択"
                        noFileText="ファイルが選択されていません"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{step.fileHint}</p>
                    </div>
                    <Button
                      onClick={() => handleUpload(step.id)}
                      disabled={!status.file || isDisabled}
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      アップロード
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {successCount} / {IMPORT_STEPS.length} ステップ完了
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              閉じる
            </Button>
          )}
          {onComplete && (
            <Button onClick={onComplete} disabled={!allRequiredComplete}>
              <ArrowRight className="h-4 w-4 mr-1" />
              完了して請求書生成へ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
