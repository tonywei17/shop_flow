"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

export function DashboardHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
  const pathname = usePathname();
  const segments = React.useMemo(() => (pathname || "/").split("/").filter(Boolean), [pathname]);

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="h-14 px-4 flex items-center gap-3">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex flex-col gap-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {segments.map((seg, i) => {
                const href = "/" + segments.slice(0, i + 1).join("/");
                const isLast = i === segments.length - 1;
                return (
                  <React.Fragment key={href}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="capitalize">{seg}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link className="capitalize" href={href}>{seg}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      </div>
    </div>
  );
}
