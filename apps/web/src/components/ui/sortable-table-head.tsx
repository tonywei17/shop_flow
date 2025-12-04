"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortOrder = "asc" | "desc" | null;

export type SortableTableHeadProps = {
  children: React.ReactNode;
  sortKey: string;
  currentSortKey: string | null;
  currentSortOrder: SortOrder;
  onSort: (key: string, order: SortOrder) => void;
  className?: string;
};

export function SortableTableHead({
  children,
  sortKey,
  currentSortKey,
  currentSortOrder,
  onSort,
  className,
}: SortableTableHeadProps) {
  const isActive = currentSortKey === sortKey;
  const nextOrder: SortOrder = !isActive
    ? "asc"
    : currentSortOrder === "asc"
      ? "desc"
      : currentSortOrder === "desc"
        ? null
        : "asc";

  const handleClick = () => {
    onSort(sortKey, nextOrder);
  };

  return (
    <TableHead
      className={cn(
        "cursor-pointer select-none transition-colors hover:bg-muted/50",
        isActive && "text-foreground",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        <span className="inline-flex h-4 w-4 items-center justify-center">
          {isActive && currentSortOrder === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 text-primary" />
          ) : isActive && currentSortOrder === "desc" ? (
            <ArrowDown className="h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
        </span>
      </div>
    </TableHead>
  );
}

// Hook to manage sort state with URL params
export function useSortState(
  searchParams: URLSearchParams | null,
  defaultSortKey?: string,
  defaultSortOrder?: SortOrder
) {
  const sortKey = searchParams?.get("sort") ?? defaultSortKey ?? null;
  const sortOrderParam = searchParams?.get("order");
  const sortOrder: SortOrder =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : defaultSortOrder ?? null;

  return { sortKey, sortOrder };
}

// Helper to update URL with sort params
export function updateSortSearchParams(
  searchParams: URLSearchParams | null,
  sortKey: string | null,
  sortOrder: SortOrder
): URLSearchParams {
  const params = new URLSearchParams(searchParams?.toString() ?? "");

  if (sortKey && sortOrder) {
    params.set("sort", sortKey);
    params.set("order", sortOrder);
  } else {
    params.delete("sort");
    params.delete("order");
  }

  // Reset to page 1 when sorting changes
  params.delete("page");

  return params;
}
