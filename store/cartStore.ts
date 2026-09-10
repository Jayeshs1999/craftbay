import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  /** _id of the seller whose products are currently in the cart. null = cart empty */
  cartSellerId: string | null;
  /** null = nothing pending; set when user tries to add from a different seller */
  pendingAdd: { product: Product; quantity: number; variant?: string } | null;

  addItem:            (product: Product, quantity?: number, variant?: string) => "ok" | "conflict";
  confirmReplace:     () => void;          // clear cart then add the pending item
  cancelPendingAdd:   () => void;          // discard the pending add
  removeItem:         (productId: string, variant?: string) => void;
  updateQty:          (productId: string, quantity: number, variant?: string) => void;
  clearCart:          () => void;
  total:              () => number;
  count:              () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartSellerId: null,
      pendingAdd: null,

      addItem: (product, quantity = 1, variant) => {
        const sellerId = (product.seller as any)?._id ?? (product.seller as unknown as string);
        const { cartSellerId, items } = get();

        // If cart has items from a DIFFERENT seller → flag conflict, do NOT add
        if (cartSellerId && cartSellerId !== sellerId && items.length > 0) {
          set({ pendingAdd: { product, quantity, variant } });
          return "conflict";
        }

        set((s) => {
          const existing = s.items.find(
            (i) => i.product._id === product._id && i.variant === variant
          );
          if (existing) {
            return {
              cartSellerId: sellerId,
              items: s.items.map((i) =>
                i.product._id === product._id && i.variant === variant
                  ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
                  : i
              ),
            };
          }
          return {
            cartSellerId: sellerId,
            items: [...s.items, { product, quantity, variant }],
          };
        });
        return "ok";
      },

      confirmReplace: () => {
        const { pendingAdd } = get();
        if (!pendingAdd) return;
        const sellerId = (pendingAdd.product.seller as any)?._id ?? (pendingAdd.product.seller as unknown as string);
        set({
          items: [{ product: pendingAdd.product, quantity: pendingAdd.quantity, variant: pendingAdd.variant }],
          cartSellerId: sellerId,
          pendingAdd: null,
        });
      },

      cancelPendingAdd: () => set({ pendingAdd: null }),

      removeItem: (productId, variant) =>
        set((s) => {
          const next = s.items.filter(
            (i) => !(i.product._id === productId && i.variant === variant)
          );
          return { items: next, cartSellerId: next.length === 0 ? null : s.cartSellerId };
        }),

      updateQty: (productId, quantity, variant) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.product._id === productId && i.variant === variant
              ? { ...i, quantity }
              : i
          ),
        })),

      clearCart: () => set({ items: [], cartSellerId: null, pendingAdd: null }),

      total: () => get().items.reduce((s, i) => s + i.product.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "banavoo-cart" }
  )
);
