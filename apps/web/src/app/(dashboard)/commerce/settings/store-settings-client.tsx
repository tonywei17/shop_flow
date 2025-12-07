"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { StoreSettings } from "@enterprise/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Store, Calculator, Truck, Settings } from "lucide-react";
import { toast } from "sonner";

type Props = {
  initialSettings: StoreSettings | null;
};

export function StoreSettingsClient({ initialSettings }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Form state
  const [storeName, setStoreName] = React.useState(initialSettings?.store_name ?? "オンラインストア");
  const [storeStatus, setStoreStatus] = React.useState<string>(initialSettings?.store_status ?? "active");
  const [taxRate, setTaxRate] = React.useState(String(initialSettings?.tax_rate ?? 10));
  const [taxType, setTaxType] = React.useState<string>(initialSettings?.tax_type ?? "exclusive");
  const [shippingFee, setShippingFee] = React.useState(String(initialSettings?.shipping_fee ?? 0));
  const [freeShippingEnabled, setFreeShippingEnabled] = React.useState(initialSettings?.free_shipping_threshold !== null);
  const [freeShippingThreshold, setFreeShippingThreshold] = React.useState(
    String(initialSettings?.free_shipping_threshold ?? 5000)
  );
  const [roundingMethod, setRoundingMethod] = React.useState<string>(initialSettings?.rounding_method ?? "round");
  const [minimumOrderAmount, setMinimumOrderAmount] = React.useState(
    String(initialSettings?.minimum_order_amount ?? 0)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/internal/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: storeName,
          store_status: storeStatus,
          tax_rate: Number(taxRate),
          tax_type: taxType,
          shipping_fee: Number(shippingFee),
          free_shipping_threshold: freeShippingEnabled ? Number(freeShippingThreshold) : null,
          rounding_method: roundingMethod,
          minimum_order_amount: Number(minimumOrderAmount),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "保存に失敗しました");
      }

      toast.success("設定を保存しました");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本設定 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">基本設定</CardTitle>
          </div>
          <CardDescription>店舗の基本情報を設定します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="store-name">店舗名</Label>
              <Input
                id="store-name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="オンラインストア"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>店舗状態</Label>
              <RadioGroup
                value={storeStatus}
                onValueChange={setStoreStatus}
                className="flex flex-row gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="status-active" value="active" />
                  <Label htmlFor="status-active" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                    営業中
                    <Badge className="bg-green-500 text-white border-none text-[10px]">OPEN</Badge>
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="status-maintenance" value="maintenance" />
                  <Label htmlFor="status-maintenance" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                    メンテナンス中
                    <Badge className="bg-amber-500 text-white border-none text-[10px]">CLOSED</Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 税設定 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">税設定</CardTitle>
          </div>
          <CardDescription>消費税の計算方法を設定します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tax-rate">消費税率 (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>税計算方式</Label>
              <RadioGroup
                value={taxType}
                onValueChange={setTaxType}
                className="flex flex-row gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="tax-exclusive" value="exclusive" />
                  <Label htmlFor="tax-exclusive" className="text-sm font-normal cursor-pointer">
                    外税（税抜価格表示）
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="tax-inclusive" value="inclusive" />
                  <Label htmlFor="tax-inclusive" className="text-sm font-normal cursor-pointer">
                    内税（税込価格表示）
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 配送設定 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">配送設定</CardTitle>
          </div>
          <CardDescription>送料に関する設定を行います</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shipping-fee">固定送料（円）</Label>
              <Input
                id="shipping-fee"
                type="number"
                min="0"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                placeholder="500"
                required
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="free-shipping-toggle" className="cursor-pointer">
                  送料無料を有効にする
                </Label>
                <Switch
                  id="free-shipping-toggle"
                  checked={freeShippingEnabled}
                  onCheckedChange={setFreeShippingEnabled}
                />
              </div>
              {freeShippingEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="free-shipping-threshold">送料無料の閾値（円）</Label>
                  <Input
                    id="free-shipping-threshold"
                    type="number"
                    min="0"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    placeholder="5000"
                  />
                  <p className="text-xs text-muted-foreground">
                    この金額以上の注文で送料無料になります
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 計算設定 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">計算設定</CardTitle>
          </div>
          <CardDescription>金額計算に関する設定を行います</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>端数処理</Label>
              <RadioGroup
                value={roundingMethod}
                onValueChange={setRoundingMethod}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="rounding-round" value="round" />
                  <Label htmlFor="rounding-round" className="text-sm font-normal cursor-pointer">
                    四捨五入
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="rounding-floor" value="floor" />
                  <Label htmlFor="rounding-floor" className="text-sm font-normal cursor-pointer">
                    切り捨て
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="rounding-ceil" value="ceil" />
                  <Label htmlFor="rounding-ceil" className="text-sm font-normal cursor-pointer">
                    切り上げ
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimum-order">最低注文金額（円）</Label>
              <Input
                id="minimum-order"
                type="number"
                min="0"
                value={minimumOrderAmount}
                onChange={(e) => setMinimumOrderAmount(e.target.value)}
                placeholder="0"
                required
              />
              <p className="text-xs text-muted-foreground">
                0の場合は制限なし
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              設定を保存
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
