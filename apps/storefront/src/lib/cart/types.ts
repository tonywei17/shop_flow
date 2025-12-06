export type CartItem = {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
};

export type CartContextType = {
  cart: Cart;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
};
