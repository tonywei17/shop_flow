'use client';

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DepartmentWithParent } from "@enterprise/db";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Building2, Download, FolderTree } from "lucide-react";
import { buildVisiblePages, updatePaginationSearchParams } from "@/lib/pagination";

export type DepartmentsPagination = {
  page: number;
  limit: number;
  count: number;
  search: string;
};

export function DepartmentsClient({
  departments,
  pagination,
}: {
  departments: DepartmentWithParent[];
  pagination: DepartmentsPagination;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(pagination.count / pagination.limit));

  const updateQuery = React.useCallback(
    (next: { page?: number; search?: string }) => {
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

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const query = (form.get("search") as string) ?? "";
    updateQuery({ page: 1, search: query.trim() });
  };

  const visiblePages = React.useMemo(
    () => buildVisiblePages(pagination.page, totalPages),
    [pagination.page, totalPages],
  );

  return (
    <Card className="rounded-xl border border-[#11111114] bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-b border-[#11111114] px-6 py-3 text-sm text-[#111111] lg:flex-row lg:items-center lg:justify-between">
          <label htmlFor="dept-select-all" className="flex items-center gap-3">
            <Checkbox id="dept-select-all" aria-label="全て選択" />
            <span>全て選択</span>
          </label>
          <form className="flex flex-1 flex-wrap items-center gap-3 lg:justify-end" onSubmit={handleSearch}>
            <Input
              name="search"
              defaultValue={pagination.search}
              placeholder="部署名・責任者・地域で検索"
              className="w-full max-w-xs"
            />
            <Button type="submit" variant="outline">
              検索
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]">
                <Download className="h-4 w-4" />
                組織図エクスポート
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                組織構成を編集
              </Button>
            </div>
          </form>
        </div>

        <Table className="[&_th]:py-3 [&_td]:py-3 text-sm">
          <TableHeader>
            <TableRow className="border-b border-[#11111114] text-[#111111]">
              <TableHead className="w-[36px] pl-6 pr-3">
                <Checkbox aria-label="行を選択" />
              </TableHead>
              <TableHead className="w-[100px]">部署ID</TableHead>
              <TableHead className="w-[200px]">部署名</TableHead>
              <TableHead className="w-[160px]">区分</TableHead>
              <TableHead className="w-[160px]">上位部署</TableHead>
              <TableHead className="w-[200px]">責任者</TableHead>
              <TableHead className="w-[160px]">電話番号</TableHead>
              <TableHead>所在地</TableHead>
              <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept) => (
              <TableRow key={dept.id} className="border-b border-[#11111114]">
                <TableCell className="pl-6 pr-3">
                  <Checkbox aria-label={`${dept.name} を選択`} />
                </TableCell>
                <TableCell className="font-mono text-xs text-[#555555]">
                  {dept.external_id ?? '--'}
                </TableCell>
                <TableCell className="text-[#111111]">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#6b7280]" />
                    <div className="flex flex-col">
                      <span>{dept.name}</span>
                      <span className="text-xs text-muted-foreground">{dept.code || '未設定'}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[#555555]">{dept.category ?? '--'}</TableCell>
                <TableCell className="text-[#555555]">{dept.parent_name ?? '—'}</TableCell>
                <TableCell className="text-[#555555]">{dept.manager_name || '—'}</TableCell>
                <TableCell className="text-[#555555]">{dept.phone_primary || '—'}</TableCell>
                <TableCell className="text-[#555555]">
                  {[dept.prefecture, dept.city, dept.address_line1, dept.address_line2]
                    .filter(Boolean)
                    .join(' ') || '—'}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Button variant="ghost" size="sm" className="text-[#00ac4d] hover:bg-[#00ac4d14]">
                    詳細
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!departments.length ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                  部署データがありません。
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
  );
}
