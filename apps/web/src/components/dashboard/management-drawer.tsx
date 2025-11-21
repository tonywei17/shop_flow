import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export type ManagementDrawerProps = {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  isSubmitting?: boolean;
  widthClassName?: string;
};

export function ManagementDrawer({
  open,
  title,
  onOpenChange,
  onSubmit,
  children,
  footer,
  primaryActionLabel,
  secondaryActionLabel,
  isSubmitting,
  widthClassName,
}: ManagementDrawerProps) {
  const primaryLabel = primaryActionLabel ?? "保存";
  const secondaryLabel = secondaryActionLabel ?? "キャンセル";

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className={`w-full border-l bg-white sm:w-[420px] sm:max-w-none lg:w-[25vw] lg:max-w-[25vw] ${widthClassName ?? ""}`}
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg font-bold text-[#111111]">{title}</SheetTitle>
        </SheetHeader>
        <form className="flex h-full flex-1 flex-col gap-6" onSubmit={onSubmit}>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">{children}</div>
          {footer ? (
            footer
          ) : (
            <SheetFooter className="mt-auto flex-row gap-3 border-t border-[#f0f0f0] px-6 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {secondaryLabel}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#00ac4d] text-white hover:bg-[#00943f]"
                disabled={isSubmitting}
              >
                {primaryLabel}
              </Button>
            </SheetFooter>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
