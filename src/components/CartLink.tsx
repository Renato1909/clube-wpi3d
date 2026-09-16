"use client";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CartLink({ mobile = false }: { mobile?: boolean }) {
  const { quantity, ready } = useCart();
  const label = ready && quantity > 0 ? `Carrinho (${quantity})` : "Carrinho";
  return <Link href="/carrinho" className={mobile ? "rounded-lg px-3 py-3 hover:bg-gray-50" : "text-sm font-semibold text-[#0A2E5D] hover:underline"}>{label}</Link>;
}
