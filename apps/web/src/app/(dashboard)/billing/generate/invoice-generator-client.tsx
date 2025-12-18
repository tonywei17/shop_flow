"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Users,
  Building2,
  CreditCard,
  Wallet,
  FileText,
  Calendar,
  Mail,
  Clock,
  Download,
  Zap,
  Package,
  Receipt,
  Send,
  ChevronRight,
} from "lucide-react";
import { MonthPicker, getPreviousMonth, formatMonthDisplay } from "@/components/billing/month-picker";

// ============================================
// Types
// ============================================

type WizardStep = "upload" | "type" | "confirm" | "email" | "generate";

interface FileUploadStatus {
  status: "pending" | "uploading" | "success" | "error" | "existing";
  file?: File;
  progress?: string;
  result?: {
    success_count: number;
    error_count: number;
    message?: string;
  };
  existingData?: {
    file_name?: string;
    imported_at?: string;
    success_count?: number;
  };
}

interface UploadStatusResponse {
  billing_month: string;
  child_count: { uploaded: boolean; file_name?: string; imported_at?: string; success_count?: number };
  aigran: { uploaded: boolean; file_name?: string; imported_at?: string; success_count?: number };
  bank_transfer: { uploaded: boolean; file_name?: string; imported_at?: string; success_count?: number };
  expenses: { uploaded: boolean; file_name?: string; imported_at?: string; success_count?: number };
}

interface InvoiceType {
  id: "branch" | "agency";
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface SummaryData {
  previousBalance: {
    count: number;
    amount: number;
  };
  materialOrders: {
    count: number;
    stripeAmount: number;
    invoiceAmount: number;
    totalAmount: number;
  };
  ccMembers: {
    branchCount: number;
    classroomCount: number;
    memberCount: number;
    amount: number;
  };
  otherExpenses: {
    count: number;
    amount: number;
  };
  invoiceCount: number;
}

interface EmailSettings {
  autoSend: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  selectedRecipients: Set<string>;
}

interface SenderInfo {
  email: string;
  name: string;
}

interface Recipient {
  id: string;
  store_code: string;
  branch_name: string;
  manager_name: string | null;
  contact_email: string | null;
  email_source: "department" | "account" | null;
  member_count: number;
  amount: number;
}

interface GenerationProgress {
  status: "idle" | "generating" | "completed" | "error";
  current: number;
  total: number;
  currentDepartment?: string;
  results: {
    success: number;
    error: number;
    errors: string[];
  };
}

// ============================================
// Constants
// ============================================

const FILE_UPLOAD_STEPS = [
  {
    id: "child_count",
    title: "① チャイルド数（全教室）",
    description: "全教室の会員数データをインポートします",
    icon: <Users className="h-5 w-5" />,
    fileHint: "例: 11月度チャイルド数.xlsx",
    required: true,
  },
  {
    id: "aigran",
    title: "② アイグラン（特約教室）",
    description: "アイグラン特約教室のデータで上書き",
    icon: <Building2 className="h-5 w-5" />,
    fileHint: "例: アイグラン11月度.xlsx",
    required: false,
  },
  {
    id: "bank_transfer",
    title: "③ 口座振替教室一覧",
    description: "口座振替済みの教室を請求対象から除外",
    icon: <CreditCard className="h-5 w-5" />,
    fileHint: "例: 11月 口座振替教室一覧.xlsx",
    required: false,
  },
  {
    id: "expenses",
    title: "④ その他費用",
    description: "その他費用データをインポート（任意）",
    icon: <Wallet className="h-5 w-5" />,
    fileHint: "例: その他費用.csv",
    required: false,
  },
];

const INVOICE_TYPES: InvoiceType[] = [
  {
    id: "branch",
    title: "支局請求書",
    description: "各支局向けの請求書を生成します。教材費、CC会員費、その他費用を含みます。",
    icon: <Building2 className="h-6 w-6" />,
  },
  {
    id: "agency",
    title: "代行請求書",
    description: "収納代行向けの請求書を生成します。口座振替済みの教室分を集計します。",
    icon: <CreditCard className="h-6 w-6" />,
  },
];

const WIZARD_STEPS: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
  { id: "upload", label: "データ準備", icon: <Upload className="h-4 w-4" /> },
  { id: "type", label: "種類選択", icon: <FileText className="h-4 w-4" /> },
  { id: "confirm", label: "データ確認", icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: "email", label: "送付設定", icon: <Mail className="h-4 w-4" /> },
  { id: "generate", label: "生成", icon: <Zap className="h-4 w-4" /> },
];

// ============================================
// Helper Functions
// ============================================

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

// ============================================
// Main Component
// ============================================

export function InvoiceGeneratorClient() {
  // State
  const [currentStep, setCurrentStep] = React.useState<WizardStep>("upload");
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getPreviousMonth());
  const [fileStatuses, setFileStatuses] = React.useState<Record<string, FileUploadStatus>>({
    child_count: { status: "pending" },
    aigran: { status: "pending" },
    bank_transfer: { status: "pending" },
    expenses: { status: "pending" },
  });
  const [selectedInvoiceType, setSelectedInvoiceType] = React.useState<"branch" | "agency">("branch");
  const [summaryData, setSummaryData] = React.useState<SummaryData | null>(null);
  const [loadingSummary, setLoadingSummary] = React.useState(false);
  const [emailSettings, setEmailSettings] = React.useState<EmailSettings>({
    autoSend: false,
    selectedRecipients: new Set<string>(),
  });
  const [senderInfo, setSenderInfo] = React.useState<SenderInfo | null>(null);
  const [recipients, setRecipients] = React.useState<Recipient[]>([]);
  const [loadingEmailSettings, setLoadingEmailSettings] = React.useState(false);
  const [generationProgress, setGenerationProgress] = React.useState<GenerationProgress>({
    status: "idle",
    current: 0,
    total: 0,
    results: { success: 0, error: 0, errors: [] },
  });

  // Fetch existing upload status when month changes
  const fetchUploadStatus = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/invoices/upload-status?billing_month=${selectedMonth}`);
      if (response.ok) {
        const data: UploadStatusResponse = await response.json();
        
        setFileStatuses((prev) => {
          const newStatuses = { ...prev };
          
          // Update each file type status
          const fileTypes = ["child_count", "aigran", "bank_transfer", "expenses"] as const;
          for (const fileType of fileTypes) {
            const uploadData = data[fileType];
            // Only update if not currently uploading and data exists
            if (prev[fileType].status !== "uploading" && uploadData?.uploaded) {
              newStatuses[fileType] = {
                status: "existing",
                existingData: {
                  file_name: uploadData.file_name,
                  imported_at: uploadData.imported_at,
                  success_count: uploadData.success_count,
                },
              };
            } else if (prev[fileType].status !== "uploading" && prev[fileType].status !== "success") {
              // Reset to pending if no data exists
              newStatuses[fileType] = { status: "pending" };
            }
          }
          
          return newStatuses;
        });
      }
    } catch (error) {
      console.error("Error fetching upload status:", error);
    }
  }, [selectedMonth]);

  // Fetch upload status on mount and when month changes
  React.useEffect(() => {
    fetchUploadStatus();
  }, [fetchUploadStatus]);

  // Fetch email settings (sender info and recipients)
  const fetchEmailSettings = React.useCallback(async () => {
    setLoadingEmailSettings(true);
    try {
      const response = await fetch(
        `/api/invoices/email-settings?billing_month=${selectedMonth}&type=${selectedInvoiceType}`
      );
      if (response.ok) {
        const data = await response.json();
        setSenderInfo(data.sender);
        setRecipients(data.recipients);
        // Select only recipients with email addresses by default
        const recipientsWithEmail = data.recipients.filter((r: Recipient) => r.contact_email);
        setEmailSettings((prev) => ({
          ...prev,
          selectedRecipients: new Set(recipientsWithEmail.map((r: Recipient) => r.id)),
        }));
      }
    } catch (error) {
      console.error("Error fetching email settings:", error);
    } finally {
      setLoadingEmailSettings(false);
    }
  }, [selectedMonth, selectedInvoiceType]);

  // Fetch email settings when entering email step
  React.useEffect(() => {
    if (currentStep === "email") {
      fetchEmailSettings();
    }
  }, [currentStep, fetchEmailSettings]);

  // Computed
  const requiredFilesUploaded = FILE_UPLOAD_STEPS.filter((s) => s.required).every(
    (s) => fileStatuses[s.id].status === "success" || fileStatuses[s.id].status === "existing"
  );

  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);

  // Handlers
  const handleFileSelect = (stepId: string, file: File | null) => {
    if (!file) return;
    setFileStatuses((prev) => ({
      ...prev,
      [stepId]: { ...prev[stepId], file, status: "pending" },
    }));
  };

  const handleFileUpload = async (stepId: string) => {
    const stepStatus = fileStatuses[stepId];
    if (!stepStatus.file) return;

    setFileStatuses((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        status: "uploading",
        progress: "ファイル読み込み中...",
      },
    }));

    try {
      const formData = new FormData();
      formData.append("file", stepStatus.file);
      formData.append("file_type", stepId);
      formData.append("billing_month", selectedMonth);

      // Different API endpoint for expenses
      const endpoint = stepId === "expenses" 
        ? "/api/expenses/import" 
        : "/api/cc-members/import";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setFileStatuses((prev) => ({
          ...prev,
          [stepId]: {
            ...prev[stepId],
            status: "success",
            progress: undefined,
            result: {
              success_count: result.success_count || result.successCount || 0,
              error_count: result.error_count || result.errorCount || 0,
            },
          },
        }));
      } else {
        setFileStatuses((prev) => ({
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
      setFileStatuses((prev) => ({
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

  const handleFileReset = (stepId: string) => {
    setFileStatuses((prev) => ({
      ...prev,
      [stepId]: { status: "pending" },
    }));
  };

  const fetchSummaryData = async () => {
    setLoadingSummary(true);
    try {
      const response = await fetch(
        `/api/invoices/summary?billing_month=${selectedMonth}&type=${selectedInvoiceType}`
      );
      if (response.ok) {
        const data = await response.json();
        setSummaryData(data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerate = async () => {
    const totalCount = summaryData?.invoiceCount || 0;
    
    setGenerationProgress({
      status: "generating",
      current: 0,
      total: totalCount,
      results: { success: 0, error: 0, errors: [] },
    });

    // Start simulated progress animation
    let simulatedProgress = 0;
    const progressInterval = setInterval(() => {
      simulatedProgress += Math.random() * 3 + 1; // Random increment between 1-4
      if (simulatedProgress >= totalCount * 0.9) {
        simulatedProgress = Math.floor(totalCount * 0.9); // Cap at 90% until complete
      }
      setGenerationProgress((prev) => ({
        ...prev,
        current: Math.min(Math.floor(simulatedProgress), totalCount - 1),
      }));
    }, 200);

    try {
      const response = await fetch("/api/invoices/generate-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_month: selectedMonth,
          invoice_type: selectedInvoiceType,
          auto_send: emailSettings.autoSend,
          scheduled_at: emailSettings.autoSend && emailSettings.scheduledDate
            ? `${emailSettings.scheduledDate}T${emailSettings.scheduledTime || "09:00"}:00`
            : null,
        }),
      });

      clearInterval(progressInterval);
      const result = await response.json();

      if (response.ok) {
        setGenerationProgress({
          status: "completed",
          current: result.total,
          total: result.total,
          results: {
            success: result.success_count,
            error: result.error_count,
            errors: result.errors || [],
          },
        });
      } else {
        setGenerationProgress((prev) => ({
          ...prev,
          status: "error",
          results: {
            ...prev.results,
            errors: [result.error || "生成中にエラーが発生しました"],
          },
        }));
      }
    } catch (error) {
      clearInterval(progressInterval);
      setGenerationProgress((prev) => ({
        ...prev,
        status: "error",
        results: {
          ...prev.results,
          errors: ["生成中にエラーが発生しました"],
        },
      }));
    }
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < WIZARD_STEPS.length) {
      const nextStep = WIZARD_STEPS[nextIndex].id;
      setCurrentStep(nextStep);
      
      // Fetch summary when entering confirm step
      if (nextStep === "confirm") {
        fetchSummaryData();
      }
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(WIZARD_STEPS[prevIndex].id);
    }
  };

  // ============================================
  // Render Functions
  // ============================================

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {WIZARD_STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <button
            onClick={() => {
              if (index <= currentStepIndex) {
                setCurrentStep(step.id);
                if (step.id === "confirm") fetchSummaryData();
              }
            }}
            disabled={index > currentStepIndex}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              step.id === currentStep
                ? "bg-primary text-primary-foreground"
                : index < currentStepIndex
                ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/70"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {index < currentStepIndex ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              step.icon
            )}
            <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
          </button>
          {index < WIZARD_STEPS.length - 1 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">データ準備</h2>
        <p className="text-sm text-muted-foreground mt-1">
          対象月分: <span className="font-medium">{formatMonthDisplay(selectedMonth)}</span>
        </p>
      </div>

      {/* Month Picker */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">対象月分:</span>
            <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          </div>
          <p className="text-xs text-muted-foreground">
            ※「月分」は該当月内に発生したデータの請求期間を指します
          </p>
        </div>
      </div>

      {/* File Upload Cards */}
      <div className="grid gap-4">
        {FILE_UPLOAD_STEPS.map((step, index) => {
          const status = fileStatuses[step.id];
          const prevStatus = index > 0 ? fileStatuses[FILE_UPLOAD_STEPS[index - 1].id].status : null;
          const isDisabled = step.id !== "expenses" && index > 0 && 
            prevStatus !== "success" && prevStatus !== "existing";

          return (
            <Card
              key={step.id}
              className={`transition-all ${
                status.status === "success" || status.status === "existing"
                  ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30"
                  : status.status === "error"
                  ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30"
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
                        status.status === "success" || status.status === "existing"
                          ? "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
                          : status.status === "error"
                          ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {step.title}
                        {step.required ? (
                          <Badge variant="destructive" className="text-xs">必須</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">任意</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">{step.description}</CardDescription>
                    </div>
                  </div>
                  {status.status === "uploading" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  ) : status.status === "success" || status.status === "existing" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : status.status === "error" ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {status.status === "existing" ? (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          {status.existingData?.success_count 
                            ? `${status.existingData.success_count}件 インポート済み`
                            : "データがインポート済みです"}
                        </span>
                      </div>
                      {status.existingData?.file_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ファイル: {status.existingData.file_name}
                        </p>
                      )}
                      {status.existingData?.imported_at && (
                        <p className="text-xs text-muted-foreground">
                          インポート日時: {new Date(status.existingData.imported_at).toLocaleString("ja-JP")}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleFileReset(step.id)}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      再アップロード
                    </Button>
                  </div>
                ) : status.status === "success" ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {status.result?.success_count}件 インポート完了
                        {status.result?.error_count ? ` (${status.result.error_count}件エラー)` : ""}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleFileReset(step.id)}>
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
                    <Button variant="outline" size="sm" onClick={() => handleFileReset(step.id)}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      やり直す
                    </Button>
                  </div>
                ) : status.status === "uploading" ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{status.progress}</span>
                    </div>
                    <Progress value={60} className="h-1" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        disabled={isDisabled}
                        onChange={(e) => handleFileSelect(step.id, e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{step.fileHint}</p>
                    </div>
                    <Button
                      onClick={() => handleFileUpload(step.id)}
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
    </div>
  );

  const renderTypeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">請求書種類の選択</h2>
        <p className="text-sm text-muted-foreground mt-1">
          生成する請求書の種類を選択してください
        </p>
      </div>

      <RadioGroup
        value={selectedInvoiceType}
        onValueChange={(value) => setSelectedInvoiceType(value as "branch" | "agency")}
        className="grid gap-4"
      >
        {INVOICE_TYPES.map((type) => (
          <Label
            key={type.id}
            htmlFor={type.id}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedInvoiceType === type.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
            <div
              className={`p-3 rounded-lg ${
                selectedInvoiceType === type.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {type.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{type.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">データ確認</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {formatMonthDisplay(selectedMonth)} の請求データを確認してください
        </p>
      </div>

      {loadingSummary ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">データを集計中...</span>
        </div>
      ) : summaryData ? (
        <div className="grid gap-4">
          {/* Previous Balance */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-base">前月請求書支払残額</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{summaryData.previousBalance.count} 件の未払い請求書</span>
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(summaryData.previousBalance.amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Material Orders */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base">教材注文金額</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Stripe支払済み</span>
                <span>{formatCurrency(summaryData.materialOrders.stripeAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">請求書払い（未払い）</span>
                <span>{formatCurrency(summaryData.materialOrders.invoiceAmount)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-medium">{summaryData.materialOrders.count} 件の注文</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(summaryData.materialOrders.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* CC Members */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <CardTitle className="text-base">CC会員費用</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">対象支局数</span>
                <span>{summaryData.ccMembers.branchCount} 支局</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">対象教室数</span>
                <span>{summaryData.ccMembers.classroomCount} 教室</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">会員数</span>
                <span>{summaryData.ccMembers.memberCount} 名</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-medium">合計金額</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(summaryData.ccMembers.amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Other Expenses */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-base">その他費用</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{summaryData.otherExpenses.count} 件の費用</span>
                <span className="text-xl font-bold text-purple-600">
                  {formatCurrency(summaryData.otherExpenses.amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Count Summary */}
          <Card className="border-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">生成予定の請求書</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedInvoiceType === "branch" ? "支局請求書" : "代行請求書"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{summaryData.invoiceCount}</p>
                  <p className="text-sm text-muted-foreground">件</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          データの取得に失敗しました
        </div>
      )}
    </div>
  );

  // Recipient selection handlers
  const handleSelectAllRecipients = (checked: boolean) => {
    if (checked) {
      setEmailSettings((prev) => ({
        ...prev,
        selectedRecipients: new Set(recipients.map((r) => r.id)),
      }));
    } else {
      setEmailSettings((prev) => ({
        ...prev,
        selectedRecipients: new Set(),
      }));
    }
  };

  const handleToggleRecipient = (id: string) => {
    setEmailSettings((prev) => {
      const newSet = new Set(prev.selectedRecipients);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { ...prev, selectedRecipients: newSet };
    });
  };

  const isAllRecipientsSelected = recipients.length > 0 && 
    recipients.every((r) => emailSettings.selectedRecipients.has(r.id));

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">送付設定</h2>
        <p className="text-sm text-muted-foreground mt-1">
          請求書の自動送付設定を行います
        </p>
      </div>

      {loadingEmailSettings ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">設定を読み込み中...</span>
        </div>
      ) : (
        <>
          {/* Sender Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base">送信元</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{senderInfo?.name || "未設定"}</p>
                  <p className="text-sm text-muted-foreground">{senderInfo?.email || "環境変数で設定してください"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto Send Toggle */}
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  id="auto-send"
                  checked={emailSettings.autoSend}
                  onCheckedChange={(checked) =>
                    setEmailSettings((prev) => ({ ...prev, autoSend: !!checked }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="auto-send" className="font-medium cursor-pointer">
                    請求書を自動送付する
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    生成後、選択した支局の登録メールアドレスに請求書PDFを自動送付します
                  </p>
                </div>
              </div>

              {/* Scheduled Send */}
              {emailSettings.autoSend && (
                <div className="pl-8 space-y-4 border-l-2 border-primary/20 ml-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>送付タイミング</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduled-date">送付日</Label>
                      <Input
                        id="scheduled-date"
                        type="date"
                        value={emailSettings.scheduledDate || ""}
                        onChange={(e) =>
                          setEmailSettings((prev) => ({ ...prev, scheduledDate: e.target.value }))
                        }
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduled-time">送付時刻</Label>
                      <Input
                        id="scheduled-time"
                        type="time"
                        value={emailSettings.scheduledTime || "09:00"}
                        onChange={(e) =>
                          setEmailSettings((prev) => ({ ...prev, scheduledTime: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    ※ 日時を指定しない場合は、生成完了後すぐに送付されます
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipients Selection - Only show when autoSend is enabled */}
          {emailSettings.autoSend && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-base">送付先選択</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{emailSettings.selectedRecipients.size} / {recipients.length} 件選択</span>
                  </div>
                </div>
                <CardDescription>
                  請求書を送付する支局を選択してください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Select All */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Checkbox
                    id="select-all"
                    checked={isAllRecipientsSelected}
                    onCheckedChange={handleSelectAllRecipients}
                  />
                  <Label htmlFor="select-all" className="font-medium cursor-pointer flex-1">
                    すべて選択
                  </Label>
                </div>

                {/* Recipients List */}
                <div className="max-h-[400px] overflow-y-auto space-y-2 border rounded-lg p-2">
                  {recipients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      送付先がありません
                    </div>
                  ) : (
                    recipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          emailSettings.selectedRecipients.has(recipient.id)
                            ? "bg-primary/5 border-primary/30"
                            : "bg-background hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          id={`recipient-${recipient.id}`}
                          checked={emailSettings.selectedRecipients.has(recipient.id)}
                          onCheckedChange={() => handleToggleRecipient(recipient.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`recipient-${recipient.id}`}
                              className="font-medium cursor-pointer"
                            >
                              {recipient.branch_name || `支局 ${recipient.store_code}`}
                            </Label>
                            <Badge variant="outline" className="text-xs">
                              {recipient.store_code}
                            </Badge>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {recipient.manager_name && (
                              <span className="mr-3">担当: {recipient.manager_name}</span>
                            )}
                            {recipient.contact_email ? (
                              <>
                                <span className="text-blue-600">{recipient.contact_email}</span>
                                {recipient.email_source === "account" && (
                                  <span className="ml-1 text-xs text-muted-foreground">(アカウント)</span>
                                )}
                              </>
                            ) : (
                              <span className="text-orange-500">メールアドレス未設定</span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            会員数: {recipient.member_count}名 ｜ 金額: {formatCurrency(recipient.amount)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );

  const renderGenerateStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">請求書生成</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {formatMonthDisplay(selectedMonth)} の請求書を生成します
        </p>
      </div>

      {generationProgress.status === "idle" ? (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">対象月</span>
                <span className="font-medium">{formatMonthDisplay(selectedMonth)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">請求書種類</span>
                <span className="font-medium">
                  {selectedInvoiceType === "branch" ? "支局請求書" : "代行請求書"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">生成件数</span>
                <span className="font-medium">{summaryData?.invoiceCount || 0} 件</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">自動送付</span>
                <span className="font-medium">{emailSettings.autoSend ? "あり" : "なし"}</span>
              </div>
            </div>

            {/* Generate Button */}
            <Button onClick={handleGenerate} className="w-full" size="lg">
              <Zap className="h-5 w-5 mr-2" />
              請求書を生成する
            </Button>
          </CardContent>
        </Card>
      ) : generationProgress.status === "generating" ? (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="font-medium">請求書を生成中...</p>
              {generationProgress.currentDepartment && (
                <p className="text-sm text-muted-foreground mt-1">
                  {generationProgress.currentDepartment}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">進捗</span>
                <span className="font-medium">
                  {generationProgress.current} / {generationProgress.total}
                </span>
              </div>
              <Progress
                value={(generationProgress.current / generationProgress.total) * 100}
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
                <span className="text-green-600 dark:text-green-400">成功</span>
                <span className="font-medium text-green-600 dark:text-green-400">{generationProgress.results.success}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/50 rounded-lg">
                <span className="text-red-600 dark:text-red-400">エラー</span>
                <span className="font-medium text-red-600 dark:text-red-400">{generationProgress.results.error}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : generationProgress.status === "completed" ? (
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="font-semibold text-lg">生成完了</p>
              <p className="text-sm text-muted-foreground mt-1">
                請求書の生成が完了しました
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <span className="text-green-700 dark:text-green-400">成功</span>
                <span className="font-bold text-green-700 dark:text-green-400">{generationProgress.results.success} 件</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <span className="text-red-700 dark:text-red-400">エラー</span>
                <span className="font-bold text-red-700 dark:text-red-400">{generationProgress.results.error} 件</span>
              </div>
            </div>

            {generationProgress.results.errors.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 rounded-lg">
                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">エラー詳細:</p>
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                  {generationProgress.results.errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <a href="/billing/invoices">
                  <FileText className="h-4 w-4 mr-2" />
                  請求書一覧を見る
                </a>
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setCurrentStep("upload");
                  setGenerationProgress({
                    status: "idle",
                    current: 0,
                    total: 0,
                    results: { success: 0, error: 0, errors: [] },
                  });
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                新規生成
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="font-semibold text-lg">エラーが発生しました</p>
              <p className="text-sm text-muted-foreground mt-1">
                {generationProgress.results.errors[0] || "生成中にエラーが発生しました"}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setGenerationProgress({
                  status: "idle",
                  current: 0,
                  total: 0,
                  results: { success: 0, error: 0, errors: [] },
                });
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              やり直す
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ============================================
  // Main Render
  // ============================================

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <div className="mb-8">
        {currentStep === "upload" && renderUploadStep()}
        {currentStep === "type" && renderTypeStep()}
        {currentStep === "confirm" && renderConfirmStep()}
        {currentStep === "email" && renderEmailStep()}
        {currentStep === "generate" && renderGenerateStep()}
      </div>

      {/* Navigation */}
      {generationProgress.status === "idle" && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={goToPrevStep}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>

          {currentStep !== "generate" && (
            <Button
              onClick={goToNextStep}
              disabled={
                (currentStep === "upload" && !requiredFilesUploaded) ||
                (currentStep === "confirm" && loadingSummary)
              }
            >
              次へ
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
