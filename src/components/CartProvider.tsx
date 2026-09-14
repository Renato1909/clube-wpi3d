"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { cartQuantity, normalizeCart, type CartItem } from "@/lib/cart";

const STORAGE_KEY = "clube-wpi3d-cart";
type CartContextValue = { items: CartItem[]; quantity: number; ready: boolean; addItem: (slug: string) => void; setQuantity: (slug: string, quantity: number) => void; removeItem: (slug: string) => void; clearCart: () => void };
const CartContext = createContext<CartContextValue | null>(null);

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try { setItems(normalizeCart(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"))); }
      catch { localStorage.removeItem(STORAGE_KEY); }
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items, ready]);

  const value = useMemo<CartContextValue>(() => ({
    items, quantity: cartQuantity(items), ready,
    addItem: (slug) => setItems((current) => normalizeCart([...current, { slug, quantity: 1 }])),
    setQuantity: (slug, quantity) => setItems((current) => normalizeCart(current.map((item) => item.slug === slug ? { ...item, quantity } : item))),
    removeItem: (slug) => setItems((current) => current.filter((item) => item.slug !== slug)),
    clearCart: () => setItems([]),
  }), [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de CartProvider");
  return context;
}
