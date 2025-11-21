'use client';

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminAccount } from "@enterprise/db";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Download, Edit, Plus } from "lucide-react";
import { ManagementDrawer } from "@/components/dashboard/management-drawer";

export type AccountsPagination = {
  page: number;
  limit: number;
  count: number;
  search: string;
  scope: string;
  status: string;
};

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  有効: { label: "有効", className: "bg-[#e5f5ec] text-[#00ac4d]" },
  無効: { label: "無効", className: "bg-[#fff0f0] text-[#d82b2b]" },
  停止中: { label: "停止中", className: "bg-[#fff5e6] text-[#d9822b]" },
};

function getStatusBadge(status: string | null | undefined) {
  if (!status) return { label: "未設定", className: "bg-[#f4f4f5] text-[#6b7280]" };
  return statusBadgeMap[status] ?? { label: status, className: "bg-[#f4f4f5] text-[#6b7280]" };
}

type AccountFormState = {
  accountId: string;
  status: boolean;
  displayName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  department: string;
  delegateBilling: boolean;
  priceDisplay: string;
  facility: string;
  representative: string;
};

const roleOptions = [
  { value: "hq", label: "本部" },
  { value: "branch", label: "支局" },
  { value: "classroom", label: "教室" },
  { value: "merchant", label: "加盟店" },
];

const priceDisplayOptions = [
  { value: "hq", label: "本部価格" },
  { value: "branch", label: "支局価格" },
  { value: "hidden", label: "非表示" },
];

function createFormState(account?: AdminAccount): AccountFormState {
  return {
    accountId: account?.account_id ?? "",
    status: account ? account.status === "有効" : true,
    displayName: account?.display_name ?? "",
    email: account?.email ?? "",
    phone: account?.phone ?? "",
    password: "",
    role: account?.role_code ?? roleOptions[0]!.value,
    department: account?.department_name ?? "",
    delegateBilling: account?.account_scope === "storefront" ? true : true,
    priceDisplay: priceDisplayOptions[0]!.value,
    facility: account?.department_name ?? "",
    representative: account?.display_name ?? "",
  };
}

export function AccountClient({
  accounts,
  pagination,
}: {
  accounts: AdminAccount[];
  pagination: AccountsPagination;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerState, setDrawerState] = React.useState<{
    open: boolean;
    mode: "create" | "edit";
    account: AdminAccount | null;
  }>({ open: false, mode: "create", account: null });
  const [formState, setFormState] = React.useState<AccountFormState>(() => createFormState());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const isEditing = drawerState.mode === "edit";

  const totalPages = Math.max(1, Math.ceil(pagination.count / pagination.limit));

  React.useEffect(() => {
    setFormState(createFormState(drawerState.account ?? undefined));
  }, [drawerState.account, drawerState.mode]);

  const departmentOptions = React.useMemo(() => {
    const names = new Set<string>();
    accounts.forEach((account) => {
      if (account.department_name) {
        names.add(account.department_name);
      }
    });
    return Array.from(names.values());
  }, [accounts]);

  const updateQuery = React.useCallback(
    (next: { page?: number; search?: string; scope?: string; status?: string }) => {
      const params = new URLSearchParams(searchParams?.toString());
      const nextPage = next.page ?? pagination.page;
      params.set("page", String(Math.max(1, Math.min(totalPages, nextPage))));
      params.set("limit", String(pagination.limit));

      if (typeof next.search === "string") {
        if (next.search) {
          params.set("q", next.search);
        } else {
          params.delete("q");
        }
      }

      if (typeof next.scope === "string") {
        if (next.scope) {
          params.set("scope", next.scope);
        } else {
          params.delete("scope");
        }
      }

      if (typeof next.status === "string") {
        if (next.status) {
          params.set("status", next.status);
        } else {
          params.delete("status");
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pagination.limit, pagination.page, pathname, router, searchParams, totalPages],
  );

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const query = (form.get("search") as string) ?? "";
    updateQuery({ page: 1, search: query.trim() });
  };

  const handleDrawerOpen = (mode: "create" | "edit", account?: AdminAccount) => {
    setDrawerState({ open: true, mode, account: account ?? null });
  };

  const handleDrawerClose = () => {
    setDrawerState({ open: false, mode: "create", account: null });
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      handleDrawerClose();
    } else {
      setDrawerState((prev) => ({ ...prev, open }));
    }
  };

  const handleFormChange = (field: keyof AccountFormState) => (value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: Record<string, unknown> = {
        mode: drawerState.mode,
        id: drawerState.account?.id,
        account_id: formState.accountId,
        display_name: formState.displayName,
        email: formState.email,
        phone: formState.phone,
        status: formState.status,
        role_code: formState.role,
        department_name: formState.department,
        account_scope: pagination.scope || "admin_portal",
      };

      const response = await fetch("/api/internal/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        const message = data?.error || `Failed to save account (status ${response.status})`;
        throw new Error(message);
      }

      handleDrawerClose();

      const params = new URLSearchParams(searchParams?.toString());
      router.replace(`${pathname}?${params.toString()}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "アカウントの保存に失敗しました";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const visiblePages = React.useMemo(() => {
    const pages: number[] = [];
    const add = (value: number) => {
      if (value >= 1 && value <= totalPages && !pages.includes(value)) {
        pages.push(value);
      }
    };

    add(1);
    add(totalPages);
    add(pagination.page);
    add(pagination.page - 1);
    add(pagination.page + 1);

    return pages
      .filter((value) => value >= 1 && value <= totalPages)
      .filter((value, index, arr) => arr.indexOf(value) === index)
      .sort((a, b) => a - b);
  }, [pagination.page, totalPages]);

  return (
    <>
      <Card className="rounded-xl border border-[#11111114] bg-white shadow-sm">
        <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-b border-[#11111114] px-6 py-3 text-sm text-[#111111] lg:flex-row lg:items-center lg:justify-between">
          <label htmlFor="accounts-select-all" className="flex items-center gap-3">
            <Checkbox id="accounts-select-all" aria-label="全て選択" />
            <span>全て選択</span>
          </label>
          <div className="flex flex-1 flex-wrap items-center gap-3 lg:justify-end">
            <form className="flex items-center gap-2" onSubmit={handleSearch}>
              <Input
                name="search"
                defaultValue={pagination.search}
                placeholder="氏名・メール・IDで検索"
                className="h-9 w-[220px]"
              />
              <Button type="submit" variant="outline">
                検索
              </Button>
            </form>
            <Button
              variant={pagination.scope === "storefront" ? "default" : "outline"}
              className="h-9"
              onClick={() => updateQuery({ scope: pagination.scope === "storefront" ? "" : "storefront", page: 1 })}
            >
              オンラインストア
            </Button>
            <Button
              variant={pagination.scope === "admin_portal" ? "default" : "outline"}
              className="h-9"
              onClick={() => updateQuery({ scope: pagination.scope === "admin_portal" ? "" : "admin_portal", page: 1 })}
            >
              管理画面
            </Button>
            <Button
              variant={pagination.status === "有効" ? "default" : "outline"}
              className="h-9"
              onClick={() => updateQuery({ status: pagination.status === "有効" ? "" : "有効", page: 1 })}
            >
              有効のみ
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]">
                <Download className="h-4 w-4" />
                一括操作
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                エクスポート
              </Button>
              <Button
                className="flex items-center gap-2 bg-[#00ac4d] px-4 py-[6px] text-sm font-medium text-white hover:bg-[#00943f]"
                onClick={() => handleDrawerOpen("create")}
              >
                <Plus className="h-[14px] w-[14px]" />
                新規追加
              </Button>
            </div>
          </div>
        </div>

        <Table className="[&_th]:py-3 [&_td]:py-3">
          <TableHeader>
            <TableRow className="border-b border-[#11111114] text-[14px] text-[#111111]">
              <TableHead className="w-[36px] pl-6 pr-3">
                <Checkbox aria-label="行を選択" />
              </TableHead>
              <TableHead className="w-[130px]">アカウントID</TableHead>
              <TableHead className="w-[160px]">氏名</TableHead>
              <TableHead className="w-[240px]">メールアドレス</TableHead>
              <TableHead className="w-[180px]">所属部署</TableHead>
              <TableHead className="w-[140px]">最終ログイン</TableHead>
              <TableHead className="w-[120px]">ステータス</TableHead>
              <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const statusBadge = getStatusBadge(account.status);
              return (
                <TableRow key={account.id} className="border-b border-[#11111114] text-[14px]">
                  <TableCell className="pl-6 pr-3">
                    <Checkbox aria-label={`${account.display_name} を選択`} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#555555]">
                    <div className="flex flex-col">
                      <span>{account.account_id}</span>
                      <span className="text-[10px] text-muted-foreground">#{account.external_id ?? '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#111111]">{account.display_name}</TableCell>
                  <TableCell className="text-[#555555]">{account.email ?? '—'}</TableCell>
                  <TableCell className="text-[#555555]">{account.department_name ?? '—'}</TableCell>
                  <TableCell className="text-[#555555]">
                    {account.last_login_at ? new Date(account.last_login_at).toLocaleString('ja-JP') : '未ログイン'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`border-none px-3 py-1 text-[12px] ${statusBadge.className}`}>{statusBadge.label}</Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]"
                      onClick={() => handleDrawerOpen("edit", account)}
                    >
                      <Edit className="h-4 w-4" />
                      編集
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!accounts.length ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                  アカウントデータがありません。
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-4 border-t border-[#11111114] px-6 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground">
            全 {pagination.count} 件（{pagination.page} / {totalPages} ページ）
          </p>
          <Pagination className="w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className="px-2"
                  aria-disabled={pagination.page <= 1}
                  onClick={(event) => {
                    event.preventDefault();
                    if (pagination.page > 1) {
                      updateQuery({ page: pagination.page - 1 });
                    }
                  }}
                />
              </PaginationItem>
              {visiblePages.map((pageNumber, index) => {
                const isActive = pageNumber === pagination.page;
                const prevPage = visiblePages[index - 1];
                const showEllipsis = index > 0 && pageNumber - (prevPage ?? 0) > 1;
                return (
                  <React.Fragment key={`page-${pageNumber}`}>
                    {showEllipsis ? (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : null}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        aria-current={isActive ? "page" : undefined}
                        className="min-w-[36px]"
                        onClick={(event) => {
                          event.preventDefault();
                          if (!isActive) {
                            updateQuery({ page: pageNumber });
                          }
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  className="px-2"
                  aria-disabled={pagination.page >= totalPages}
                  onClick={(event) => {
                    event.preventDefault();
                    if (pagination.page < totalPages) {
                      updateQuery({ page: pagination.page + 1 });
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
        </CardContent>
      </Card>

      <ManagementDrawer
        open={drawerState.open}
        onOpenChange={handleDrawerOpenChange}
        title={isEditing ? "アカウント編集" : "アカウント新規追加"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-3">
          {submitError ? (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {submitError}
            </p>
          ) : null}

          <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-account-id" className="text-xs font-medium text-[#555555]">
                アカウントID
              </Label>
              <Input
                id="form-account-id"
                value={formState.accountId}
                onChange={(event) => handleFormChange("accountId")(event.target.value)}
                placeholder="example"
                disabled={isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[#555555]">ステータス</Label>
              <div className="flex items-center justify-between rounded-lg border border-[#e5e5e5] px-3 py-2">
                <div className="text-xs text-[#6b7280]">利用可否を切り替え</div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formState.status}
                    onCheckedChange={(checked) => handleFormChange("status")(checked)}
                  />
                  <span className="text-sm text-[#111111]">{formState.status ? "有効" : "無効"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-display-name" className="text-xs font-medium text-[#555555]">
                アカウント名
              </Label>
              <Input
                id="form-display-name"
                value={formState.displayName}
                onChange={(event) => handleFormChange("displayName")(event.target.value)}
                placeholder="山田 太郎"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-password" className="text-xs font-medium text-[#555555]">
                パスワード
              </Label>
              <Input
                id="form-password"
                type="password"
                value={formState.password}
                onChange={(event) => handleFormChange("password")(event.target.value)}
                placeholder="example"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-role" className="text-xs font-medium text-[#555555]">
                ロール
              </Label>
              <Select value={formState.role} onValueChange={(value) => handleFormChange("role")(value)}>
                <SelectTrigger id="form-role">
                  <SelectValue placeholder="ロールを選択" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-department" className="text-xs font-medium text-[#555555]">
                部署
              </Label>
              <Select
                value={formState.department}
                onValueChange={(value) => handleFormChange("department")(value)}
              >
                <SelectTrigger id="form-department">
                  <SelectValue placeholder="部署を選択" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.length === 0 ? (
                    <SelectItem value="">
                      未設定
                    </SelectItem>
                  ) : (
                    departmentOptions.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between rounded-lg border border-[#e5e5e5] px-3 py-2">
              <div>
                <Label className="text-xs font-medium text-[#555555]">代行請求</Label>
                <p className="text-xs text-[#6b7280]">代理店向け請求を許可</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formState.delegateBilling}
                  onCheckedChange={(checked) => handleFormChange("delegateBilling")(checked)}
                />
                <span className="text-sm text-[#111111]">{formState.delegateBilling ? "有効" : "無効"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-price" className="text-xs font-medium text-[#555555]">
                価格表示
              </Label>
              <Select
                value={formState.priceDisplay}
                onValueChange={(value) => handleFormChange("priceDisplay")(value)}
              >
                <SelectTrigger id="form-price">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {priceDisplayOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-email" className="text-xs font-medium text-[#555555]">
              メールアドレス
            </Label>
            <Input
              id="form-email"
              type="email"
              value={formState.email}
              onChange={(event) => handleFormChange("email")(event.target.value)}
              placeholder="example@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-phone" className="text-xs font-medium text-[#555555]">
              電話番号
            </Label>
            <Input
              id="form-phone"
              value={formState.phone}
              onChange={(event) => handleFormChange("phone")(event.target.value)}
              placeholder="090-0000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-facility" className="text-xs font-medium text-[#555555]">
              施設名・宛先
            </Label>
            <Input
              id="form-facility"
              value={formState.facility}
              onChange={(event) => handleFormChange("facility")(event.target.value)}
              placeholder="example"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-representative" className="text-xs font-medium text-[#555555]">
              代表者名
            </Label>
            <Input
              id="form-representative"
              value={formState.representative}
              onChange={(event) => handleFormChange("representative")(event.target.value)}
              placeholder="example"
            />
          </div>
          </div>
        </div>
      </ManagementDrawer>
    </>
  );
}
