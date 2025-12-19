"use client";

import * as React from "react";
import { getAddressByZip } from "japan-address-autofill";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

export interface AddressData {
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
}

interface AddressInputProps {
  value: AddressData;
  onChange: (address: AddressData) => void;
  required?: boolean;
  disabled?: boolean;
  showLabels?: boolean;
  labelSize?: "xs" | "sm";
  idPrefix?: string;
}

export function AddressInput({
  value,
  onChange,
  required = false,
  disabled = false,
  showLabels = true,
  labelSize = "sm",
  idPrefix = "address",
}: AddressInputProps) {
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);

  const handlePostalCodeSearch = async () => {
    const cleanPostalCode = value.postalCode.replace(/[-－ー]/g, "");
    
    if (cleanPostalCode.length !== 7) {
      setSearchError("郵便番号は7桁で入力してください");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const result = await getAddressByZip(cleanPostalCode);
      
      if (result && result.prefecture) {
        onChange({
          ...value,
          prefecture: result.prefecture || "",
          city: result.city || "",
          addressLine1: result.area || "",
        });
      } else {
        setSearchError("住所が見つかりませんでした");
      }
    } catch {
      setSearchError("住所の検索に失敗しました");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    // Auto-format: add hyphen after 3 digits
    if (newValue.length === 3 && !newValue.includes("-")) {
      newValue = newValue + "-";
    }
    onChange({ ...value, postalCode: newValue });
    setSearchError(null);
  };

  const handlePostalCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handlePostalCodeSearch();
    }
  };

  const labelClassName = labelSize === "xs" ? "text-xs" : "text-sm";

  return (
    <div className="space-y-3">
      {/* 郵便番号 */}
      <div className="space-y-1.5">
        {showLabels && (
          <Label htmlFor={`${idPrefix}-postal`} className={labelClassName}>
            郵便番号 {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <div className="flex gap-2">
          <Input
            id={`${idPrefix}-postal`}
            value={value.postalCode}
            onChange={handlePostalCodeChange}
            onKeyDown={handlePostalCodeKeyDown}
            placeholder="123-4567"
            disabled={disabled}
            required={required}
            className="flex-1"
            maxLength={8}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handlePostalCodeSearch}
            disabled={disabled || isSearching}
            title="住所を検索"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        {searchError && (
          <p className="text-xs text-destructive">{searchError}</p>
        )}
        <p className="text-xs text-muted-foreground">
          郵便番号を入力して検索ボタンを押すと、住所が自動入力されます
        </p>
      </div>

      {/* 都道府県 */}
      <div className="space-y-1.5">
        {showLabels && (
          <Label htmlFor={`${idPrefix}-prefecture`} className={labelClassName}>
            都道府県 {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Input
          id={`${idPrefix}-prefecture`}
          value={value.prefecture}
          onChange={(e) => onChange({ ...value, prefecture: e.target.value })}
          placeholder="東京都"
          disabled={disabled}
          required={required}
        />
      </div>

      {/* 市区町村 */}
      <div className="space-y-1.5">
        {showLabels && (
          <Label htmlFor={`${idPrefix}-city`} className={labelClassName}>
            市区町村 {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Input
          id={`${idPrefix}-city`}
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          placeholder="渋谷区"
          disabled={disabled}
          required={required}
        />
      </div>

      {/* 番地 */}
      <div className="space-y-1.5">
        {showLabels && (
          <Label htmlFor={`${idPrefix}-address1`} className={labelClassName}>
            番地 {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Input
          id={`${idPrefix}-address1`}
          value={value.addressLine1}
          onChange={(e) => onChange({ ...value, addressLine1: e.target.value })}
          placeholder="1-2-3"
          disabled={disabled}
          required={required}
        />
      </div>

      {/* 建物名・会社名・部屋番号 */}
      <div className="space-y-1.5">
        {showLabels && (
          <Label htmlFor={`${idPrefix}-address2`} className={labelClassName}>
            建物名・会社名・部屋番号
          </Label>
        )}
        <Input
          id={`${idPrefix}-address2`}
          value={value.addressLine2}
          onChange={(e) => onChange({ ...value, addressLine2: e.target.value })}
          placeholder="○○ビル 3F"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
