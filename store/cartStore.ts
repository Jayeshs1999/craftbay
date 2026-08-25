import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  addItem:    (product: Product, quantity?: number, variant?: string) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQty:  (productId: string, quantity: number, variant?: string) => void;
  clearCart:  () => void;
  total:      () => number;
  count:      () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, variant) => {
        set((s) => {
          const key = product._id + (variant || "");
          const existing = s.items.find(
            (i) => i.product._id === product._id && i.variant === variant
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.product._id === product._id && i.variant === variant
                  ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
                  : i
              ),
            };
          }
          return { items: [...s.items, { product, quantity, variant }] };
        });
      },

      removeItem: (productId, variant) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.product._id === productId && i.variant === variant)
          ),
        })),

      updateQty: (productId, quantity, variant) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.product._id === productId && i.variant === variant
              ? { ...i, quantity }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((s, i) => s + i.product.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "craftbay-cart" }
  )
);
