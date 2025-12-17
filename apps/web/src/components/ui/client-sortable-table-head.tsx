"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc" | null;

export type SortConfig = {
  key: string | null;
  direction: SortDirection;
};

export type ClientSortableTableHeadProps = {
  children: React.ReactNode;
  sortKey: string;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  className?: string;
};

export function ClientSortableTableHead({
  children,
  sortKey,
  sortConfig,
  onSort,
  className,
}: ClientSortableTableHeadProps) {
  const isActive = sortConfig.key === sortKey;

  return (
    <TableHead
      className={cn(
        "cursor-pointer select-none transition-colors hover:bg-muted/50",
        isActive && "text-foreground",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        <span className="inline-flex h-4 w-4 items-center justify-center">
          {isActive && sortConfig.direction === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 text-primary" />
          ) : isActive && sortConfig.direction === "desc" ? (
            <ArrowDown className="h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
        </span>
      </div>
    </TableHead>
  );
}

// Hook to manage client-side sort state
export function useClientSort<T>(
  data: T[],
  defaultSortKey?: string,
  defaultDirection?: SortDirection
) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({
    key: defaultSortKey ?? null,
    direction: defaultDirection ?? null,
  });

  const handleSort = React.useCallback((key: string) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      if (prev.direction === "desc") {
        return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  }, []);

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortConfig.key!];
      const bValue = (b as Record<string, unknown>)[sortConfig.key!];

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
      if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;

      // Handle numbers
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Handle date strings
      const aDate = Date.parse(String(aValue));
      const bDate = Date.parse(String(bValue));
      if (!isNaN(aDate) && !isNaN(bDate)) {
        return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Handle strings
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      if (sortConfig.direction === "asc") {
        return aStr.localeCompare(bStr, "ja");
      }
      return bStr.localeCompare(aStr, "ja");
    });
  }, [data, sortConfig]);

  return { sortConfig, handleSort, sortedData };
}
