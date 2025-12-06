"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/context";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";

type AddToCartButtonProps = {
  product: {
    id: string;
    code: string;
    name: string;
    price: number;
    taxRate: number;
    stock: number;
    minQuantity: number;
    maxQuantity: number | null;
  };
  disabled?: boolean;
};

export function AddToCartButton({ product, disabled }: AddToCartButtonProps): React.ReactElement {
  const router = useRouter();
  const { addItem, cart } = useCart();
  const [quantity, setQuantity] = React.useState(product.minQuantity);
  const [isAdded, setIsAdded] = React.useState(false);

  // Check current quantity in cart
  const cartItem = cart.items.find((item) => item.productId === product.id);
  const currentCartQuantity = cartItem?.quantity ?? 0;

  // Calculate max allowed quantity
  const maxAllowed = product.maxQuantity
    ? Math.min(product.maxQuantity - currentCartQuantity, product.stock - currentCartQuantity)
    : product.stock - currentCartQuantity;

  const canAdd = maxAllowed > 0 && !disabled;

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(product.minQuantity, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(maxAllowed, prev + 1));
  };

  const handleAddToCart = () => {
    if (!canAdd) return;

    addItem({
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      unitPrice: product.price,
      taxRate: product.taxRate,
      quantity,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    setQuantity(product.minQuantity);
  };

  if (!canAdd && currentCartQuantity > 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          カートに {currentCartQuantity} 点入っています
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/cart")}
        >
          カートを見る
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">数量</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDecrease}
            disabled={quantity <= product.minQuantity || disabled}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleIncrease}
            disabled={quantity >= maxAllowed || disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleAddToCart}
        disabled={!canAdd || isAdded}
      >
        {isAdded ? (
          <>
            <Check className="h-5 w-5 mr-2" />
            カートに追加しました
          </>
        ) : disabled ? (
          "在庫切れ"
        ) : (
          <>
            <ShoppingCart className="h-5 w-5 mr-2" />
            カートに追加
          </>
        )}
      </Button>

      {currentCartQuantity > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          カートに {currentCartQuantity} 点入っています
        </p>
      )}
    </div>
  );
}
