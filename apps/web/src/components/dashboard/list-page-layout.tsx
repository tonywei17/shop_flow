"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ListCardProps = {
  /** Title row content (sticky) */
  titleRow?: React.ReactNode;
  /** Filter row content (sticky) */
  filterRow?: React.ReactNode;
  /** Table header content (sticky) - should be a TableHeader component */
  tableHeader?: React.ReactNode;
  /** Table body content (scrollable) */
  children: React.ReactNode;
  /** Additional className for the card */
  className?: string;
  /** Max height for the scrollable area. Default is "calc(100vh - 400px)" */
  maxHeight?: string;
};

/**
 * A Card component for list pages with sticky title, filter, and table header.
 * Only the table body scrolls while the header sections stay fixed.
 */
export function ListCard({
  titleRow,
  filterRow,
  tableHeader,
  children,
  className,
  maxHeight = "calc(100vh - 400px)",
}: ListCardProps) {
  return (
    <Card className={cn("rounded-xl border bg-card shadow-sm", className)}>
      <CardContent className="p-0">
        {/* Sticky title row */}
        {titleRow && (
          <div className="border-b border-border">{titleRow}</div>
        )}

        {/* Sticky filter row */}
        {filterRow && (
          <div className="border-b border-border">{filterRow}</div>
        )}

        {/* Scrollable table area */}
        <div className="overflow-auto" style={{ maxHeight }}>
          <table className="w-full">
            {/* Sticky table header */}
            {tableHeader && (
              <thead className="sticky top-0 z-10 bg-card [&_tr]:bg-card">
                {tableHeader}
              </thead>
            )}
            {/* Scrollable table body */}
            <tbody>{children}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
