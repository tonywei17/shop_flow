"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Mail, FileText, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  code: string;
  name: string;
  price_hq: number;
  price_branch: number;
  price_classroom: number;
  price_retail: number;
  tax_rate: number;
  is_active: boolean;
};

type OrderItem = {
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
};

type CreateOrderDialogProps = {
  products: Product[];
  onOrderCreated?: () => void;
};

const PRICE_TYPE_OPTIONS = [
  { value: "retail", label: "一般価格" },
  { value: "branch", label: "支局価格" },
  { value: "classroom", label: "教室価格" },
  { value: "hq", label: "本部価格" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "stripe_link", label: "Stripe決済リンク（メール送信）", icon: <CreditCard className="h-4 w-4" /> },
  { value: "invoice", label: "請求書に記録（月次請求）", icon: <FileText className="h-4 w-4" /> },
];

function getProductPrice(product: Product, priceType: string): number {
  switch (priceType) {
    case "hq":
      return product.price_hq;
    case "branch":
      return product.price_branch;
    case "classroom":
      return product.price_classroom;
    default:
      return product.price_retail;
  }
}

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function CreateOrderDialog({ products, onOrderCreated }: CreateOrderDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [priceType, setPriceType] = React.useState("retail");
  const [paymentMethod, setPaymentMethod] = React.useState("stripe_link");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerName, setCustomerName] = React.useState("");
  const [orderItems, setOrderItems] = React.useState<OrderItem[]>([]);
  const [shippingAddress, setShippingAddress] = React.useState({
    recipientName: "",
    postalCode: "",
    prefecture: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    phone: "",
  });
  const [notes, setNotes] = React.useState("");

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const taxAmount = orderItems.reduce((sum, item) => {
    const itemTotal = item.unit_price * item.quantity;
    return sum + Math.floor(itemTotal * (item.tax_rate / 100));
  }, 0);
  const shippingFee = subtotal >= 5000 ? 0 : 500; // Free shipping over ¥5000
  const totalAmount = subtotal + taxAmount + shippingFee;

  const handleAddProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingIndex = orderItems.findIndex((item) => item.product_id === productId);
    if (existingIndex >= 0) {
      // Increment quantity
      const newItems = [...orderItems];
      newItems[existingIndex].quantity += 1;
      setOrderItems(newItems);
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          product_id: product.id,
          product_code: product.code,
          product_name: product.name,
          quantity: 1,
          unit_price: getProductPrice(product, priceType),
          tax_rate: Number(product.tax_rate) || 10,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;
    const newItems = [...orderItems];
    newItems[index].quantity = quantity;
    setOrderItems(newItems);
  };

  // Update prices when price type changes
  const handlePriceTypeChange = React.useCallback((newPriceType: string) => {
    setPriceType(newPriceType);
    setOrderItems((prevItems) =>
      prevItems.map((item) => {
        const product = products.find((p) => p.id === item.product_id);
        if (product) {
          return {
            ...item,
            unit_price: getProductPrice(product, newPriceType),
          };
        }
        return item;
      })
    );
  }, [products]);

  const handleSubmit = async () => {
    // Validation
    if (orderItems.length === 0) {
      toast.error("商品を追加してください");
      return;
    }

    if (paymentMethod === "stripe_link" && !customerEmail) {
      toast.error("メールアドレスを入力してください");
      return;
    }

    if (!shippingAddress.recipientName || !shippingAddress.postalCode || !shippingAddress.prefecture || !shippingAddress.city || !shippingAddress.addressLine1) {
      toast.error("配送先住所を入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_type: priceType,
          payment_method: paymentMethod,
          customer_email: customerEmail,
          customer_name: customerName,
          order_items: orderItems,
          shipping_address: shippingAddress,
          subtotal,
          tax_amount: taxAmount,
          shipping_fee: shippingFee,
          total_amount: totalAmount,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "注文の作成に失敗しました");
      }

      if (paymentMethod === "stripe_link") {
        toast.success(`注文を作成しました。決済リンクを ${customerEmail} に送信しました。`);
      } else {
        toast.success("注文を作成しました。請求書に記録されます。");
      }

      // Reset form
      setOrderItems([]);
      setCustomerEmail("");
      setCustomerName("");
      setShippingAddress({
        recipientName: "",
        postalCode: "",
        prefecture: "",
        city: "",
        addressLine1: "",
        addressLine2: "",
        phone: "",
      });
      setNotes("");
      setOpen(false);
      onOrderCreated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "注文の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeProducts = products.filter((p) => p.is_active);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          注文を作成
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規注文作成</DialogTitle>
          <DialogDescription>
            手動で注文を作成し、決済リンクをメールで送信するか、請求書に記録します。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Price Type & Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>価格タイプ</Label>
              <Select value={priceType} onValueChange={handlePriceTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>支払い方法</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="font-medium">顧客情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">顧客名</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="山田 太郎"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">
                  メールアドレス
                  {paymentMethod === "stripe_link" && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div className="space-y-4">
            <h3 className="font-medium">商品選択</h3>
            <div className="space-y-2">
              <Label>商品を追加</Label>
              <Select onValueChange={handleAddProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="商品を選択..." />
                </SelectTrigger>
                <SelectContent>
                  {activeProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{product.name}</span>
                        <span className="text-muted-foreground">
                          ({product.code}) {formatCurrency(getProductPrice(product, priceType))}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order Items */}
            {orderItems.length > 0 && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
                      <div className="flex-1">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.product_code} · {formatCurrency(item.unit_price)} × {item.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                        <span className="font-medium w-24 text-right">
                          {formatCurrency(item.unit_price * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Totals */}
                  <div className="pt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>小計</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>消費税</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>送料</span>
                      <span>{shippingFee === 0 ? "無料" : formatCurrency(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t">
                      <span>合計</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="font-medium">配送先住所</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">宛名 <span className="text-destructive">*</span></Label>
                <Input
                  id="recipientName"
                  value={shippingAddress.recipientName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, recipientName: e.target.value })}
                  placeholder="山田 太郎"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  placeholder="03-1234-5678"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">郵便番号 <span className="text-destructive">*</span></Label>
                <Input
                  id="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                  placeholder="100-0001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prefecture">都道府県 <span className="text-destructive">*</span></Label>
                <Input
                  id="prefecture"
                  value={shippingAddress.prefecture}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, prefecture: e.target.value })}
                  placeholder="東京都"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">市区町村 <span className="text-destructive">*</span></Label>
                <Input
                  id="city"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  placeholder="千代田区"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine1">住所1 <span className="text-destructive">*</span></Label>
                <Input
                  id="addressLine1"
                  value={shippingAddress.addressLine1}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                  placeholder="丸の内1-1-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine2">住所2（建物名など）</Label>
                <Input
                  id="addressLine2"
                  value={shippingAddress.addressLine2}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                  placeholder="サンプルビル 3F"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="注文に関する備考があれば入力してください..."
              rows={3}
            />
          </div>

          {/* Payment Method Info */}
          {paymentMethod === "stripe_link" && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">Stripe決済リンク</div>
                  <div className="text-sm text-blue-700">
                    注文作成後、入力されたメールアドレスに決済リンクが送信されます。
                    顧客がリンクをクリックして支払いを完了すると、注文ステータスが自動的に更新されます。
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {paymentMethod === "invoice" && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4 flex items-start gap-3">
                <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-900">請求書記録</div>
                  <div className="text-sm text-amber-700">
                    この注文は月次請求書に記録されます。請求書モジュールが完成次第、
                    自動的に請求書に反映されます。
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || orderItems.length === 0}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {paymentMethod === "stripe_link" ? "注文作成 & 決済リンク送信" : "注文作成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
