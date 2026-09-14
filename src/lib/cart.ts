import { findProduct } from "./products.ts";

export type CartItem = { slug: string; quantity: number };

export function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const quantities = new Map<string, number>();
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const slug = "slug" in item && typeof item.slug === "string" ? item.slug : "";
    const quantity = "quantity" in item && typeof item.quantity === "number" ? Math.floor(item.quantity) : 0;
    if (!findProduct(slug) || quantity < 1) continue;
    quantities.set(slug, Math.min(99, (quantities.get(slug) ?? 0) + quantity));
  }
  return [...quantities].map(([slug, quantity]) => ({ slug, quantity }));
}

export function cartQuantity(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
