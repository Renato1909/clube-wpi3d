"use client";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";

export default function AddToCartButton({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  function add() { addItem(slug); setAdded(true); window.setTimeout(() => setAdded(false), 1600); }
  return <button type="button" onClick={add} className={`${compact ? "px-4 py-2.5 text-sm" : "px-5 py-3"} w-full rounded-lg bg-[#0A2E5D] font-semibold text-white transition hover:bg-[#082448]`}>{added ? "Adicionado ao carrinho ✓" : "Adicionar ao carrinho"}</button>;
}
