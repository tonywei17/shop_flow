"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, X, FileSpreadsheet, File } from "lucide-react";

export interface FileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  onFileSelect?: (file: File | null) => void;
  selectedFile?: File | null;
  buttonText?: string;
  noFileText?: string;
  showClearButton?: boolean;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      className,
      onFileSelect,
      selectedFile,
      buttonText = "ファイルを選択",
      noFileText = "ファイルが選択されていません",
      showClearButton = true,
      accept,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;

    const handleClick = () => {
      if (!disabled) {
        combinedRef.current?.click();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      onFileSelect?.(file);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (combinedRef.current) {
        combinedRef.current.value = "";
      }
      onFileSelect?.(null);
    };

    const getFileIcon = () => {
      if (!selectedFile) return null;
      const ext = selectedFile.name.toLowerCase().split(".").pop();
      if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      }
      return <File className="h-4 w-4 text-muted-foreground" />;
    };

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <input
          type="file"
          ref={combinedRef}
          onChange={handleChange}
          accept={accept}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled}
          className="shrink-0"
        >
          <Upload className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {selectedFile ? (
            <>
              {getFileIcon()}
              <span className="text-sm truncate" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              {showClearButton && !disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">クリア</span>
                </Button>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">{noFileText}</span>
          )}
        </div>
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };
