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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AccountItem } from "./expenses-client";
import { cn } from "@/lib/utils";

type Reviewer = {
  id: string;
  account_id: string;
  display_name: string;
  department_name: string | null;
  is_admin: boolean;
};

type CreateExpenseDialogProps = {
  accountItems: AccountItem[];
  onExpenseCreated: () => void;
};

const EXPENSE_TYPES = [
  { value: "課税分", label: "課税分" },
  { value: "非課税分", label: "非課税分" },
  { value: "調整・返金", label: "調整・返金" },
];

export function CreateExpenseDialog({ accountItems, onExpenseCreated }: CreateExpenseDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [reviewers, setReviewers] = React.useState<Reviewer[]>([]);
  const [isLoadingReviewers, setIsLoadingReviewers] = React.useState(false);

  // Form state
  const [storeCode, setStoreCode] = React.useState("");
  const [storeName, setStoreName] = React.useState("");
  const [expenseDate, setExpenseDate] = React.useState("");
  const [accountItemCode, setAccountItemCode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [expenseType, setExpenseType] = React.useState("課税分");
  const [amount, setAmount] = React.useState("");
  const [reviewerAccountId, setReviewerAccountId] = React.useState("");

  // Store lookup state
  const [isLoadingStore, setIsLoadingStore] = React.useState(false);
  const [storeNotFound, setStoreNotFound] = React.useState(false);

  // Account item input state
  const [accountItemInput, setAccountItemInput] = React.useState("");
  const [showAccountItemDropdown, setShowAccountItemDropdown] = React.useState(false);
  const accountItemInputRef = React.useRef<HTMLInputElement>(null);

  // Filter account items based on input
  const filteredAccountItems = React.useMemo(() => {
    if (!accountItemInput.trim()) return accountItems;
    const query = accountItemInput.toLowerCase();
    return accountItems.filter(
      (item) =>
        item.code.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)
    );
  }, [accountItems, accountItemInput]);

  // Get selected account item display
  const selectedAccountItem = React.useMemo(() => {
    return accountItems.find((item) => item.code === accountItemCode);
  }, [accountItems, accountItemCode]);

  // Fetch reviewers when dialog opens
  React.useEffect(() => {
    if (open && reviewers.length === 0) {
      setIsLoadingReviewers(true);
      fetch("/api/expenses/reviewers")
        .then((res) => res.json())
        .then((data) => {
          if (data.reviewers) {
            setReviewers(data.reviewers);
          }
        })
        .catch((err) => console.error("Failed to fetch reviewers:", err))
        .finally(() => setIsLoadingReviewers(false));
    }
  }, [open, reviewers.length]);

  // Lookup store name when store code changes (debounced)
  React.useEffect(() => {
    if (!storeCode.trim()) {
      setStoreName("");
      setStoreNotFound(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoadingStore(true);
      setStoreNotFound(false);
      try {
        const response = await fetch(`/api/departments/lookup?code=${encodeURIComponent(storeCode.trim())}`);
        const data = await response.json();
        if (data.department) {
          setStoreName(data.department.name);
          setStoreNotFound(false);
        } else {
          setStoreName("");
          setStoreNotFound(true);
        }
      } catch (error) {
        console.error("Failed to lookup store:", error);
        setStoreNotFound(true);
      } finally {
        setIsLoadingStore(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [storeCode]);

  // Handle account item selection
  const handleSelectAccountItem = (item: AccountItem) => {
    setAccountItemCode(item.code);
    setAccountItemInput(item.code); // Only show code in input
    setShowAccountItemDropdown(false);
    // Auto-fill description with account item name (user can edit)
    if (!description.trim()) {
      setDescription(item.name);
    }
  };

  // Handle account item input change
  const handleAccountItemInputChange = (value: string) => {
    setAccountItemInput(value);
    setShowAccountItemDropdown(true);
    
    // Check if input matches an account item code exactly
    const exactMatch = accountItems.find((item) => item.code === value.trim());
    if (exactMatch) {
      setAccountItemCode(exactMatch.code);
      // Auto-fill description with account item name if empty
      if (!description.trim()) {
        setDescription(exactMatch.name);
      }
    } else {
      // Clear selection if no exact match
      setAccountItemCode("");
    }
  };

  const resetForm = () => {
    setStoreCode("");
    setStoreName("");
    setStoreNotFound(false);
    setExpenseDate("");
    setAccountItemCode("");
    setAccountItemInput("");
    setDescription("");
    setExpenseType("課税分");
    setAmount("");
    setReviewerAccountId("");
  };

  const handleSubmit = async () => {
    // Validation
    if (!storeCode.trim()) {
      toast.error("店番を入力してください");
      return;
    }
    if (!storeName.trim()) {
      toast.error("店名を入力してください");
      return;
    }
    if (!expenseDate) {
      toast.error("費用発生日を選択してください");
      return;
    }
    if (!accountItemCode) {
      toast.error("勘定項目を選択してください");
      return;
    }
    if (!description.trim()) {
      toast.error("項目名を入力してください");
      return;
    }
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error("有効な金額を入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/expenses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_code: storeCode.trim(),
          store_name: storeName.trim(),
          expense_date: expenseDate,
          account_item_code: accountItemCode,
          description: description.trim(),
          expense_type: expenseType,
          amount: parseFloat(amount),
          import_source: "manual",
          reviewer_account_id: reviewerAccountId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "費用の作成に失敗しました");
      }

      toast.success("費用を作成しました");
      resetForm();
      setOpen(false);
      onExpenseCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          新規追加
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>新規費用追加</DialogTitle>
          <DialogDescription>
            その他費用を手動で追加します。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Store Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="store-code">店番 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="store-code"
                  placeholder="例: 1110004"
                  value={storeCode}
                  onChange={(e) => setStoreCode(e.target.value)}
                  className={cn(storeNotFound && "border-orange-500")}
                />
                {isLoadingStore && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {storeNotFound && (
                <p className="text-xs text-orange-500">該当する店舗が見つかりません</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-name">店名</Label>
              <Input
                id="store-name"
                placeholder="店番を入力すると自動入力されます"
                value={storeName}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          {/* Date and Account Item */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expense-date">費用発生日 <span className="text-destructive">*</span></Label>
              <Input
                id="expense-date"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-item">勘定項目 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="account-item"
                  ref={accountItemInputRef}
                  placeholder="例: 700"
                  value={accountItemInput}
                  onChange={(e) => handleAccountItemInputChange(e.target.value)}
                  onFocus={() => setShowAccountItemDropdown(true)}
                  onBlur={() => {
                    // Delay to allow click on dropdown item
                    setTimeout(() => setShowAccountItemDropdown(false), 200);
                  }}
                  className={cn(
                    accountItemCode && "border-green-500",
                    !accountItemCode && accountItemInput && "border-orange-500"
                  )}
                />
                {showAccountItemDropdown && filteredAccountItems.length > 0 && (
                  <div className="absolute z-50 mt-1 max-h-[200px] w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
                    {filteredAccountItems.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                          accountItemCode === item.code && "bg-accent"
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectAccountItem(item);
                        }}
                      >
                        <span className="font-mono text-muted-foreground">{item.code}</span>
                        <span className="ml-2">{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {accountItemCode && selectedAccountItem && (
                <p className="text-xs text-green-600">
                  {selectedAccountItem.name}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">項目名 <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              placeholder="勘定項目を選択すると自動入力されます（編集可能）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">勘定項目名が自動入力されますが、自由に編集できます</p>
          </div>

          {/* Type and Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>費用タイプ</Label>
              <Select value={expenseType} onValueChange={setExpenseType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">金額 <span className="text-destructive">*</span></Label>
              <Input
                id="amount"
                type="number"
                placeholder="例: -3960"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">マイナス値も入力可能</p>
            </div>
          </div>

          {/* Reviewer Selection */}
          <div className="space-y-2">
            <Label>審査者（任意）</Label>
            <Select value={reviewerAccountId || "none"} onValueChange={(val) => setReviewerAccountId(val === "none" ? "" : val)}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingReviewers ? "読み込み中..." : "審査者を選択..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">指定なし</SelectItem>
                {reviewers.map((reviewer) => (
                  <SelectItem key={reviewer.id} value={reviewer.id}>
                    {reviewer.display_name}
                    {reviewer.department_name && ` (${reviewer.department_name})`}
                    {reviewer.is_admin && " [管理者]"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">本部または管理者アカウントを審査者として指定できます</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "作成中..." : "作成"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
