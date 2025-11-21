'use client';

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { RoleRecord } from "@enterprise/db";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const scopeBadgeMap: Record<string, { label: string; className: string }> = {
  "すべてのデータ権限": { label: "全権限", className: "bg-[#e5f5ec] text-[#00ac4d]" },
  "カスタムデータ権限": { label: "カスタム", className: "bg-[#fff5e6] text-[#d9822b]" },
};

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  有効: { label: "有効", className: "bg-[#e5f5ec] text-[#00ac4d]" },
  無効: { label: "無効", className: "bg-[#fff0f0] text-[#d82b2b]" },
};

function getScopeBadge(scope: string | null | undefined) {
  if (!scope) return { label: "-", className: "bg-[#f4f4f5] text-[#6b7280]" };
  return scopeBadgeMap[scope] ?? { label: scope, className: "bg-[#f4f4f5] text-[#6b7280]" };
}

function getStatusBadge(status: string | null | undefined) {
  if (!status) return { label: "-", className: "bg-[#f4f4f5] text-[#6b7280]" };
  return statusBadgeMap[status] ?? { label: status, className: "bg-[#f4f4f5] text-[#6b7280]" };
}

function formatPermissions(scope: string) {
  if (scope === "すべてのデータ権限") {
    return ["全機能アクセス"];
  }
  if (scope === "カスタムデータ権限") {
    return ["カスタム設定"];
  }
  return [scope];
}

type RolesPagination = {
  page: number;
  limit: number;
  count: number;
  search: string;
};

export function RolesClient({ roles, pagination }: { roles: RoleRecord[]; pagination: RolesPagination }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(pagination.count / pagination.limit));

  const updateQuery = React.useCallback(
    (next: { page?: number; search?: string }) => {
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
      router.push(`${pathname}?${params.toString()}`);
    },
    [pagination.limit, pagination.page, pathname, router, searchParams, totalPages],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      role_id: form.get("roleId"),
      code: form.get("roleKey"),
      name: form.get("roleName"),
      data_scope: form.get("dataScope") || "すべてのデータ権限",
      status: form.get("status") || "有効",
      description: form.get("notes"),
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/internal/roles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role_id: payload.role_id ? Number(payload.role_id) : null,
            code: String(payload.code ?? "").trim(),
            name: String(payload.name ?? "").trim(),
            data_scope: String(payload.data_scope ?? "すべてのデータ権限"),
            status: String(payload.status ?? "有効"),
            description: payload.description ? String(payload.description) : null,
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

  const buildVisiblePages = () => {
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

    const sorted = pages.sort((a, b) => a - b);
    return sorted;
  };

  const visiblePages = buildVisiblePages();

  return (
    <div className="space-y-6">
      <DashboardHeader title="ロール管理" />

      <Card className="rounded-xl border border-[#11111114] bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-[#11111114] px-6 py-3 text-[14px] text-[#111111] md:flex-row md:items-center md:justify-between">
            <label htmlFor="select-all" className="flex items-center gap-3">
              <Checkbox id="select-all" aria-label="全て選択" />
              <span>全て選択</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]">
                <Download className="h-4 w-4" />
                一括操作
              </Button>
              <Button variant="outline" className="flex items-center gap-2 border-[#4190ff] text-[#4190ff] hover:bg-[#e7f0ff]">
                <Download className="h-4 w-4" />
                エクスポート
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-3 rounded-[4px] bg-[#00ac4d] px-4 py-[6px] text-sm font-medium text-white hover:bg-[#00943f]">
                    <Plus className="h-[14px] w-[14px]" />
                    <span className="text-[12px] font-medium">新規追加</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="fixed right-0 top-0 h-full max-h-full w-full max-w-[440px] translate-x-0 rounded-none border-l border-[#11111114] bg-white px-0 py-0 text-[#111111] shadow-[0_0_24px_rgba(17,17,17,0.08)] sm:w-[420px]">
                  <div className="flex h-full flex-col">
                    <DialogHeader className="border-b border-[#11111114] px-6 py-4">
                      <DialogTitle className="text-[18px] font-semibold text-[#111111]">新規ロール作成</DialogTitle>
                    </DialogHeader>
                    <form className="flex flex-1 flex-col gap-5 overflow-auto px-6 py-6" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <Label htmlFor="roleId">ロールID</Label>
                        <Input id="roleId" name="roleId" placeholder="6" type="number" min={1} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roleKey">ロールキー</Label>
                        <Input id="roleKey" name="roleKey" placeholder="honbu-admin" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roleName">ロール名</Label>
                        <Input id="roleName" name="roleName" placeholder="本社管理" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dataScope">データ範囲</Label>
                        <Input id="dataScope" name="dataScope" placeholder="すべてのデータ権限" defaultValue="すべてのデータ権限" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">状態</Label>
                        <Input id="status" name="status" placeholder="有効" defaultValue="有効" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">備考</Label>
                        <Textarea id="notes" name="notes" rows={3} placeholder="任意のメモ" />
                      </div>
                      {error ? <p className="text-sm text-destructive">{error}</p> : null}
                      <DialogFooter className="mt-auto border-t border-[#11111114] px-0 pt-4">
                        <div className="flex w-full justify-end gap-3">
                          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            キャンセル
                          </Button>
                          <Button type="submit" className="bg-[#00ac4d] text-white hover:bg-[#00943f]" disabled={isSubmitting}>
                            {isSubmitting ? "保存中..." : "作成する"}
                          </Button>
                        </div>
                      </DialogFooter>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Table className="[&_th]:py-3 [&_td]:py-3">
            <TableHeader>
              <TableRow className="border-b border-[#11111114] text-[14px] text-[#111111]">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" />
                </TableHead>
                <TableHead className="w-[80px]">ロールID</TableHead>
                <TableHead className="w-[100px]">ロールキー</TableHead>
                <TableHead className="w-[160px]">ロール名</TableHead>
                <TableHead className="w-[160px]">データ範囲</TableHead>
                <TableHead className="w-[120px]">状態</TableHead>
                <TableHead className="w-[240px]">機能権限</TableHead>
                <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles?.map((role) => {
                const scopeBadge = getScopeBadge(role.data_scope);
                const statusBadge = getStatusBadge(role.status);
                const permissions = formatPermissions(role.data_scope);
                return (
                  <TableRow key={role.id} className="border-b border-[#11111114] text-[14px]">
                    <TableCell className="pl-6 pr-3">
                      <Checkbox aria-label={`${role.name} を選択`} />
                    </TableCell>
                    <TableCell className="font-medium text-[#111111]">{role.role_id ?? "-"}</TableCell>
                    <TableCell className="font-mono text-[#555555]">{role.code}</TableCell>
                    <TableCell>
                      <Badge className="border-none px-3 py-1 text-[12px] bg-[#f4f4f5] text-[#111111]">{role.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-none px-3 py-1 text-[12px] ${scopeBadge.className}`}>{scopeBadge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-none px-3 py-1 text-[12px] ${statusBadge.className}`}>{statusBadge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-[#555555]">
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
                      <Button variant="ghost" size="sm" className="gap-1 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]">
                        <Edit className="h-4 w-4" />
                        編集
                      </Button>
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

          <div className="flex justify-end border-t border-[#11111114] px-6 py-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
