'use client';

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { RoleRecord } from "@enterprise/db";
import type { DataScopeType } from "@/lib/validation/roles";
import { DepartmentMultiSelect, type Department } from "@/components/department-multi-select";
import { DashboardHeader } from "@/components/dashboard/header";
import { navSections } from "@/components/dashboard/nav-items";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Download, Edit, Plus } from "lucide-react";
import { buildVisiblePages, updatePaginationSearchParams } from "@/lib/pagination";
import {
  SortableTableHead,
  updateSortSearchParams,
  type SortOrder as SortOrderType,
} from "@/components/ui/sortable-table-head";

const DATA_SCOPE_OPTIONS: { value: DataScopeType; label: string; description: string }[] = [
  { value: "all", label: "すべてのデータ", description: "全ての部署のデータにアクセス可能" },
  { value: "self_and_descendants", label: "所属部署と下位部署", description: "所属部署とその下位部署のデータにアクセス可能" },
  { value: "self_only", label: "所属部署のみ", description: "所属部署のデータのみアクセス可能" },
  { value: "custom", label: "カスタム", description: "特定の部署を選択してアクセス範囲を設定" },
];

const DATA_SCOPE_LABELS: Record<DataScopeType, string> = {
  all: "全データ",
  self_and_descendants: "部署+下位",
  self_only: "部署のみ",
  custom: "カスタム",
};

const scopeBadgeMap: Record<string, { label: string; className: string }> = {
  all: { label: "全データ", className: "bg-primary/10 text-primary" },
  self_and_descendants: { label: "部署+下位", className: "bg-blue-500/10 text-blue-600" },
  self_only: { label: "部署のみ", className: "bg-amber-500/10 text-amber-600" },
  custom: { label: "カスタム", className: "bg-muted text-foreground" },
  // Legacy values
  "すべてのデータ権限": { label: "全権限", className: "bg-primary/10 text-primary" },
  "カスタムデータ権限": { label: "カスタム", className: "bg-muted text-foreground" },
};

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  有効: { label: "有効", className: "bg-primary/10 text-primary" },
  無効: { label: "無効", className: "bg-destructive/10 text-destructive" },
};

function getScopeBadge(scopeType: string | null | undefined, legacyScope?: string | null) {
  // First try scopeType (new field)
  if (scopeType && scopeBadgeMap[scopeType]) {
    return scopeBadgeMap[scopeType];
  }
  // Fallback to legacy scope
  if (legacyScope && scopeBadgeMap[legacyScope]) {
    return scopeBadgeMap[legacyScope];
  }
  return { label: "-", className: "bg-muted text-muted-foreground" };
}

function getStatusBadge(status: string | null | undefined) {
  if (!status) return { label: "-", className: "bg-muted text-muted-foreground" };
  return statusBadgeMap[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
}

const FEATURE_GROUPS = navSections.map((section) => ({
  id: section.label,
  label: section.label,
  items: section.items.map((item) => ({
    id: item.href,
    label: item.label,
  })),
}));

const ALL_FEATURE_IDS: string[] = FEATURE_GROUPS.flatMap((group) =>
  group.items.map((item) => item.id),
);

/**
 * 根据 feature_permissions 数组格式化显示功能权限
 * - 如果勾选了某分组的所有功能，显示分组名
 * - 如果只勾选了某分组的部分功能，显示"分组名（一部）"
 * - 如果勾选了所有功能，显示"全機能アクセス"
 */
function formatFeaturePermissions(featurePermissions: string[] | null | undefined): string[] {
  // 如果权限数据为 null 或 undefined，视为全权限（向后兼容旧数据）
  if (featurePermissions === null || featurePermissions === undefined) {
    return ["全機能アクセス"];
  }
  
  // 如果是空数组，表示明确没有任何权限
  if (featurePermissions.length === 0) {
    return ["権限なし"];
  }

  const permissionSet = new Set(featurePermissions);

  // 检查是否勾选了所有功能
  const hasAllPermissions = ALL_FEATURE_IDS.every((id) => permissionSet.has(id));
  if (hasAllPermissions) {
    return ["全機能アクセス"];
  }

  const result: string[] = [];

  for (const group of FEATURE_GROUPS) {
    const groupItemIds = group.items.map((item) => item.id);
    const checkedCount = groupItemIds.filter((id) => permissionSet.has(id)).length;

    if (checkedCount === 0) {
      // 该分组没有任何权限，跳过
      continue;
    }

    if (checkedCount === groupItemIds.length) {
      // 该分组所有功能都勾选了
      result.push(group.label);
    } else {
      // 该分组只勾选了部分功能
      result.push(`${group.label}（一部）`);
    }
  }

  return result.length > 0 ? result : ["権限なし"];
}

const ROLES_SELECTION_STORAGE_KEY = "roles_selected_ids";

type SortOrder = "asc" | "desc" | null;

type RolesPagination = {
  page: number;
  limit: number;
  count: number;
  search: string;
  sortKey: string | null;
  sortOrder: SortOrder;
};

type RolesClientProps = {
  roles: RoleRecord[];
  departments: Department[];
  pagination: RolesPagination;
};

export function RolesClient({ roles, departments, pagination }: RolesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [editingRole, setEditingRole] = React.useState<RoleRecord | null>(null);
  const [status, setStatus] = React.useState<string>("有効");
  const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>(ALL_FEATURE_IDS);
  // Data scope state
  const [dataScopeType, setDataScopeType] = React.useState<DataScopeType>("all");
  const [allowedDepartmentIds, setAllowedDepartmentIds] = React.useState<string[]>([]);
  const totalPages = Math.max(1, Math.ceil(pagination.count / pagination.limit));
  const pageSizeOptions = [20, 50, 100];

  const updateQuery = React.useCallback(
    (next: { page?: number; search?: string; limit?: number }) => {
      const params = updatePaginationSearchParams(searchParams, {
        currentPage: pagination.page,
        totalPages,
        limit: pagination.limit,
        nextPage: next.page,
      });
      if (typeof next.search === "string") {
        if (next.search) {
          params.set("q", next.search);
        } else {
          params.delete("q");
        }
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pagination.limit, pagination.page, pathname, router, searchParams, totalPages],
  );

  const handleSort = (key: string, order: SortOrderType) => {
    const params = updateSortSearchParams(searchParams, key, order);
    if (pagination.search) params.set("q", pagination.search);
    router.push(`${pathname}?${params.toString()}`);
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(ROLES_SELECTION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const safe = parsed
          .map((value) => (typeof value === "string" ? value.trim() : ""))
          .filter((value) => value.length > 0);
        setSelectedIds(safe);
      }
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selectedIds.length) {
      window.sessionStorage.removeItem(ROLES_SELECTION_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(ROLES_SELECTION_STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  const allCurrentPageIds = React.useMemo(() => roles.map((role) => role.id), [roles]);

  const allSelectedOnPage =
    allCurrentPageIds.length > 0 && allCurrentPageIds.every((id) => selectedIds.includes(id));
  const someSelectedOnPage =
    allCurrentPageIds.length > 0 && allCurrentPageIds.some((id) => selectedIds.includes(id));

  const headerCheckboxChecked: boolean | "indeterminate" = allSelectedOnPage
    ? true
    : someSelectedOnPage
      ? "indeterminate"
      : false;

  const handleToggleSelectAllCurrentPage = (checked: boolean) => {
    if (checked) {
      const next = new Set(selectedIds);
      allCurrentPageIds.forEach((id) => next.add(id));
      setSelectedIds(Array.from(next));
    } else {
      const remove = new Set(allCurrentPageIds);
      setSelectedIds((prev) => prev.filter((id) => !remove.has(id)));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      role_id: form.get("roleId"),
      code: form.get("roleKey"),
      name: form.get("roleName"),
      description: form.get("notes"),
    };

    // Generate display label for data_scope based on type
    const dataScopeLabel = DATA_SCOPE_OPTIONS.find(opt => opt.value === dataScopeType)?.label ?? "すべてのデータ";

    startTransition(async () => {
      try {
        const response = await fetch("/api/internal/roles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: dialogMode,
            id: editingRole?.id,
            role_id: payload.role_id ? Number(payload.role_id) : null,
            code: String(payload.code ?? "").trim(),
            name: String(payload.name ?? "").trim(),
            data_scope: dataScopeLabel,
            data_scope_type: dataScopeType,
            allowed_department_ids: dataScopeType === "custom" ? allowedDepartmentIds : [],
            status: status || "有効",
            description: payload.description ? String(payload.description) : null,
            feature_permissions: selectedFeatures,
          }),
        });

        if (!response.ok) {
          const { error: errMsg } = await response.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errMsg || "Failed to create role");
        }

        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    });
  };

  const handleOpenCreate = () => {
    setDialogMode("create");
    setEditingRole(null);
    setError(null);
    setStatus("有効");
    setSelectedFeatures(ALL_FEATURE_IDS);
    setDataScopeType("all");
    setAllowedDepartmentIds([]);
    setOpen(true);
  };

  const handleOpenEdit = (role: RoleRecord) => {
    setDialogMode("edit");
    setEditingRole(role);
    setError(null);
    setStatus(role.status ?? "有効");
    const fromRole = (role as any).feature_permissions as unknown;
    if (Array.isArray(fromRole)) {
      const safe = fromRole.filter((value) => typeof value === "string" && value.trim().length > 0);
      setSelectedFeatures(safe.length ? safe : ALL_FEATURE_IDS);
    } else {
      setSelectedFeatures(ALL_FEATURE_IDS);
    }
    // Set data scope from role
    const scopeType = (role as any).data_scope_type as DataScopeType | undefined;
    setDataScopeType(scopeType ?? "all");
    const deptIds = (role as any).allowed_department_ids as string[] | undefined;
    setAllowedDepartmentIds(Array.isArray(deptIds) ? deptIds : []);
    setOpen(true);
  };

  const handleDelete = async (role: RoleRecord) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`ロール「${role.name}」を削除しますか？`);
      if (!confirmed) return;
    }

    try {
      const response = await fetch(`/api/internal/roles?id=${encodeURIComponent(role.id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const { error: errMsg } = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errMsg || `Failed to delete role (status ${response.status})`);
      }

      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "ロールの削除に失敗しました";
      if (typeof window !== "undefined") {
        window.alert(message);
      }
    }
  };

  const handleExport = async (mode: "all" | "selected") => {
    if (isExporting) return;
    if (mode === "selected" && !selectedIds.length) return;
    setIsExporting(true);
    try {
      const body = mode === "selected" ? { ids: selectedIds } : {};
      const response = await fetch("/api/internal/roles/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; rowCount?: number }
        | null;
      if (!response.ok || !data?.ok) {
        const message =
          data?.error || `エクスポートに失敗しました (status ${response.status})`;
        alert(message);
        return;
      }
      const rowCount = typeof data.rowCount === "number" ? data.rowCount : 0;
      alert(`エクスポートが完了しました（${rowCount} 件）`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "エクスポートに失敗しました";
      alert(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = (mode: "all" | "selected") => {
    if (mode === "selected" && !selectedIds.length) return;
    const base = "/api/internal/roles/export-csv";
    const url = mode === "selected" && selectedIds.length
      ? `${base}?ids=${encodeURIComponent(selectedIds.join(","))}`
      : base;
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`選択中のロール（${selectedIds.length}件）を削除しますか？`);
      if (!confirmed) return;
    }

    try {
      for (const id of selectedIds) {
        const response = await fetch(`/api/internal/roles?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          const message = data?.error || `削除に失敗しました (status ${response.status})`;
          if (typeof window !== "undefined") {
            window.alert(message);
          }
          return;
        }
      }
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "一括削除に失敗しました";
      if (typeof window !== "undefined") {
        window.alert(message);
      }
    }
  };

  const handlePageSizeChange = (nextLimit: number) => {
    if (nextLimit === pagination.limit) return;
    const newTotalPages = Math.max(1, Math.ceil(pagination.count / nextLimit));
    const params = updatePaginationSearchParams(searchParams, {
      currentPage: 1,
      totalPages: newTotalPages,
      limit: nextLimit,
      nextPage: 1,
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const visiblePages = buildVisiblePages(pagination.page, totalPages);

  return (
    <div className="space-y-6">
      <DashboardHeader title="ロール管理" />

      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-border px-6 py-3 text-sm text-foreground md:flex-row md:items-center md:justify-between">
            <label htmlFor="select-all" className="flex items-center gap-3">
              <Checkbox
                id="select-all"
                aria-label="全て選択"
                checked={headerCheckboxChecked}
                onCheckedChange={(checked) => handleToggleSelectAllCurrentPage(checked === true)}
              />
              <span>全て選択</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 text-primary hover:bg-primary/10">
                <Download className="h-4 w-4" />
                一括操作
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4" />
                    エクスポート
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>CSV でエクスポート</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleExportCsv("all")}>
                        全てのデータをエクスポート
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!selectedIds.length}
                        className={!selectedIds.length ? "text-muted-foreground opacity-50 cursor-not-allowed" : undefined}
                        onClick={() => handleExportCsv("selected")}
                      >
                        選択中のデータをエクスポート
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      {isExporting ? "Google Sheets にエクスポート中..." : "Google Sheets にエクスポート"}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleExport("all")} disabled={isExporting}>
                        全てのデータをエクスポート
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!selectedIds.length || isExporting}
                        className={!selectedIds.length || isExporting ? "text-muted-foreground" : undefined}
                        onClick={() => handleExport("selected")}
                      >
                        選択中のデータをエクスポート
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    className="flex items-center gap-3 rounded-[4px] px-4 py-[6px] text-sm font-medium"
                    onClick={handleOpenCreate}
                  >
                    <Plus className="h-[14px] w-[14px]" />
                    <span className="text-[12px] font-medium">新規追加</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="flex w-full max-w-[440px] flex-col overflow-y-auto p-0 sm:w-[420px]">
                  <div className="flex flex-1 flex-col">
                    <SheetHeader className="border-b border-border px-6 py-4">
                      <SheetTitle className="text-[18px] font-semibold text-foreground">
                        {dialogMode === "edit" ? "ロールを編集" : "新規ロール作成"}
                      </SheetTitle>
                    </SheetHeader>
                    <form className="flex flex-col gap-5 px-6 py-6" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <Label htmlFor="roleId">ロールID</Label>
                        <Input
                          id="roleId"
                          name="roleId"
                          placeholder="6"
                          type="number"
                          min={1}
                          required
                          defaultValue={editingRole?.role_id ?? ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roleKey">ロールキー</Label>
                        <Input
                          id="roleKey"
                          name="roleKey"
                          placeholder="honbu-admin"
                          required
                          defaultValue={editingRole?.code ?? ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roleName">ロール名</Label>
                        <Input
                          id="roleName"
                          name="roleName"
                          placeholder="本社管理"
                          required
                          defaultValue={editingRole?.name ?? ""}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label>データ範囲</Label>
                        <RadioGroup
                          value={dataScopeType}
                          onValueChange={(value) => setDataScopeType(value as DataScopeType)}
                          className="space-y-2"
                        >
                          {DATA_SCOPE_OPTIONS.map((option) => (
                            <div
                              key={option.value}
                              className="flex items-start gap-3 rounded-md border border-border p-3 hover:bg-muted/50"
                            >
                              <RadioGroupItem
                                id={`scope-${option.value}`}
                                value={option.value}
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={`scope-${option.value}`}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {option.label}
                                </Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                        {dataScopeType === "custom" && (
                          <div className="mt-3">
                            <Label className="text-sm text-muted-foreground mb-2 block">
                              アクセス可能な部署を選択
                            </Label>
                            <DepartmentMultiSelect
                              departments={departments}
                              selectedIds={allowedDepartmentIds}
                              onSelectionChange={setAllowedDepartmentIds}
                              placeholder="部署を検索して選択..."
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">状態</Label>
                        <RadioGroup
                          aria-label="状態"
                          value={status}
                          onValueChange={(value) => setStatus(value || "有効")}
                          className="flex flex-row gap-6"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem id="status-active" value="有効" />
                            <Label htmlFor="status-active" className="text-sm font-normal">
                              有効
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem id="status-inactive" value="無効" />
                            <Label htmlFor="status-inactive" className="text-sm font-normal">
                              無効
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">備考</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          rows={3}
                          placeholder="任意のメモ"
                          defaultValue={editingRole?.description ?? ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>機能権限</Label>
                        <div className="max-h-72 space-y-3 overflow-auto rounded-md border border-border bg-muted/30 px-3 py-3">
                          {FEATURE_GROUPS.map((group) => {
                            const itemIds = group.items.map((item) => item.id);
                            const allChecked =
                              itemIds.length > 0 && itemIds.every((id) => selectedFeatures.includes(id));
                            const someChecked =
                              !allChecked && itemIds.some((id) => selectedFeatures.includes(id));
                            const groupChecked: boolean | "indeterminate" = allChecked
                              ? true
                              : someChecked
                                ? "indeterminate"
                                : false;

                            return (
                              <div key={group.id} className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`feature-group-${group.id}`}
                                    checked={groupChecked}
                                    onCheckedChange={(checked) => {
                                      const isChecked = checked === true;
                                      setSelectedFeatures((prev) => {
                                        if (isChecked) {
                                          const next = new Set(prev);
                                          itemIds.forEach((id) => next.add(id));
                                          return Array.from(next);
                                        }
                                        const remove = new Set(itemIds);
                                        return prev.filter((id) => !remove.has(id));
                                      });
                                    }}
                                  />
                                  <Label
                                    htmlFor={`feature-group-${group.id}`}
                                    className="text-sm font-medium"
                                  >
                                    {group.label}
                                  </Label>
                                </div>
                                <div className="ml-6 space-y-1">
                                  {group.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                      <Checkbox
                                        id={`feature-${item.id}`}
                                        checked={selectedFeatures.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          const isChecked = checked === true;
                                          setSelectedFeatures((prev) => {
                                            if (isChecked) {
                                              if (prev.includes(item.id)) return prev;
                                              return [...prev, item.id];
                                            }
                                            return prev.filter((id) => id !== item.id);
                                          });
                                        }}
                                      />
                                      <Label
                                        htmlFor={`feature-${item.id}`}
                                        className="text-sm font-normal text-muted-foreground"
                                      >
                                        {item.label}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {error ? <p className="text-sm text-destructive">{error}</p> : null}
                      <SheetFooter className="mt-auto border-t border-border px-0 pt-4">
                        <div className="flex w-full justify-end gap-3">
                          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            キャンセル
                          </Button>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                              ? "保存中..."
                              : dialogMode === "edit"
                                ? "保存する"
                                : "作成する"}
                          </Button>
                        </div>
                      </SheetFooter>
                    </form>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <Table className="[&_th]:py-3 [&_td]:py-3">
            <TableHeader>
              <TableRow className="border-b border-border text-sm text-foreground">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox
                    aria-label="行を選択"
                    checked={headerCheckboxChecked}
                    onCheckedChange={(checked) => handleToggleSelectAllCurrentPage(checked === true)}
                  />
                </TableHead>
                <SortableTableHead
                  sortKey="role_id"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder}
                  onSort={handleSort}
                  className="w-[80px]"
                >
                  ロールID
                </SortableTableHead>
                <SortableTableHead
                  sortKey="code"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder}
                  onSort={handleSort}
                  className="w-[100px]"
                >
                  ロールキー
                </SortableTableHead>
                <SortableTableHead
                  sortKey="name"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder}
                  onSort={handleSort}
                  className="w-[160px]"
                >
                  ロール名
                </SortableTableHead>
                <SortableTableHead
                  sortKey="data_scope"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder}
                  onSort={handleSort}
                  className="w-[160px]"
                >
                  データ範囲
                </SortableTableHead>
                <SortableTableHead
                  sortKey="status"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder}
                  onSort={handleSort}
                  className="w-[120px]"
                >
                  状態
                </SortableTableHead>
                <TableHead className="w-[240px]">機能権限</TableHead>
                <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles?.map((role) => {
                const roleAny = role as any;
                const scopeBadge = getScopeBadge(roleAny.data_scope_type, role.data_scope);
                const statusBadge = getStatusBadge(role.status);
                const permissions = formatFeaturePermissions(role.feature_permissions);
                return (
                  <TableRow key={role.id} className="border-b border-border text-sm">
                    <TableCell className="pl-6 pr-3">
                      <Checkbox
                        aria-label={`${role.name} を選択`}
                        checked={selectedIds.includes(role.id)}
                        onCheckedChange={(checked) => {
                          const isChecked = checked === true;
                          setSelectedIds((prev) => {
                            if (isChecked) {
                              if (prev.includes(role.id)) return prev;
                              return [...prev, role.id];
                            }
                            return prev.filter((id) => id !== role.id);
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{role.role_id ?? "-"}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{role.code}</TableCell>
                    <TableCell>
                      <Badge className="border-none px-3 py-1 text-[12px] bg-muted text-foreground">{role.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-none px-3 py-1 text-[12px] ${scopeBadge.className}`}>{scopeBadge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-none px-3 py-1 text-[12px] ${statusBadge.className}`}>{statusBadge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {permissions.length === 1 ? (
                        <span>{permissions[0]}</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {permissions.map((permission) => (
                            <span key={permission}>・{permission}</span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 px-2 py-1 text-primary hover:bg-primary/10"
                          onClick={() => handleOpenEdit(role)}
                        >
                          <Edit className="h-4 w-4" />
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1 text-xs text-destructive border-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(role)}
                        >
                          削除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!roles?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    ロールデータがありません。
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 border-t border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs text-destructive border-destructive/40"
              disabled={!selectedIds.length}
              onClick={handleBulkDelete}
            >
              一括削除
            </Button>
            <p className="text-xs text-muted-foreground">
              全 {pagination.count} 件（{pagination.page} / {totalPages} ページ）
            </p>
            <div className="flex flex-col items-start gap-3 text-xs text-muted-foreground md:flex-row md:items-center md:gap-4">
              <div className="flex items-center gap-2">
                <span>表示件数:</span>
                <div className="flex items-center gap-1">
                  {pageSizeOptions.map((size) => (
                    <Button
                      key={size}
                      type="button"
                      size="sm"
                      variant={pagination.limit === size ? "default" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={() => handlePageSizeChange(size)}
                    >
                      {size}行
                    </Button>
                  ))}
                </div>
              </div>
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
                            if (!isActive) updateQuery({ page: pageNumber });
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
