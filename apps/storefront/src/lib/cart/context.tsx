"use client";

import * as React from "react";
import type { Cart, CartContextType, CartItem } from "./types";

const CART_STORAGE_KEY = "storefront_cart";

const emptyCart: Cart = {
  items: [],
  subtotal: 0,
  taxAmount: 0,
  total: 0,
};

function calculateCart(items: CartItem[]): Cart {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const taxAmount = items.reduce(
    (sum, item) =>
      sum + Math.floor(item.unitPrice * item.quantity * (item.taxRate / 100)),
    0
  );
  return {
    items,
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
  };
}

const CartContext = React.createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = React.useState<Cart>(emptyCart);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load cart from localStorage on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as CartItem[];
        setCart(calculateCart(items));
      }
    } catch {
      // Ignore errors
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage when it changes
  React.useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
  }, [cart.items, isLoaded]);

  const addItem = React.useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setCart((prev) => {
        const existingIndex = prev.items.findIndex(
          (i) => i.productId === item.productId
        );
        let newItems: CartItem[];

        if (existingIndex >= 0) {
          // Update existing item quantity
          newItems = prev.items.map((i, index) =>
            index === existingIndex
              ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
              : i
          );
        } else {
          // Add new item
          newItems = [
            ...prev.items,
            { ...item, quantity: item.quantity ?? 1 },
          ];
        }

        return calculateCart(newItems);
      });
    },
    []
  );

  const removeItem = React.useCallback((productId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((i) => i.productId !== productId);
      return calculateCart(newItems);
    });
  }, []);

  const updateQuantity = React.useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      setCart((prev) => {
        const newItems = prev.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        );
        return calculateCart(newItems);
      });
    },
    [removeItem]
  );

  const clearCart = React.useCallback(() => {
    setCart(emptyCart);
  }, []);

  const itemCount = React.useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items]
  );

  const value = React.useMemo(
    () => ({
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
    }),
    [cart, addItem, removeItem, updateQuantity, clearCart, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
