"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { findProduct } from "@/lib/products";

function QuantityInput({ label, quantity, onCommit }: { label: string; quantity: number; onCommit: (quantity: number) => void }) {
  const [value, setValue] = useState(String(quantity));

  useEffect(() => { setValue(String(quantity)); }, [quantity]);

  function commit() {
    const nextQuantity = Number(value);
    if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
      setValue(String(quantity));
      return;
    }

    const normalizedQuantity = Math.min(99, Math.floor(nextQuantity));
    setValue(String(normalizedQuantity));
    onCommit(normalizedQuantity);
  }

  return <input
    aria-label={label}
    type="number"
    min="1"
    max="99"
    inputMode="numeric"
    value={value}
    onChange={(event) => setValue(event.target.value)}
    onBlur={commit}
    onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
    className="mt-1 block w-20 rounded-lg border border-gray-300 px-3 py-2 text-base"
  />;
}

export default function CartPage() {
  const { items, quantity, ready, setQuantity, removeItem, clearCart } = useCart();
  const rows = items.flatMap((item) => { const product = findProduct(item.slug); return product ? [{ ...item, product }] : []; });
  if (!ready) return <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-600">Carregando seu carrinho…</div>;
  if (!rows.length) return <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center md:p-12"><h1 className="text-3xl font-bold text-[#0A2E5D]">Seu carrinho está vazio</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">Explore as peças de demonstração e guarde aqui as que mais interessarem.</p><Link href="/loja" className="mt-6 inline-block rounded-lg bg-[#0A2E5D] px-6 py-3 font-semibold text-white">Ver produtos</Link></div>;

  return <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
    <section aria-labelledby="cart-title" className="rounded-2xl border border-gray-200 bg-white p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 id="cart-title" className="text-3xl font-bold text-[#0A2E5D]">Seu carrinho</h1><p className="mt-2 text-sm text-gray-600">{quantity} {quantity === 1 ? "item selecionado" : "itens selecionados"}</p></div><button type="button" onClick={clearCart} className="text-sm font-semibold text-red-700 hover:underline">Esvaziar carrinho</button></div>
      <ul className="mt-6 divide-y divide-gray-200">{rows.map(({ product, quantity: itemQuantity }) => <li key={product.slug} className="flex flex-col gap-4 py-6 sm:flex-row">
        <Link href={`/loja/${product.slug}`} className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl bg-[#EEF1F5] sm:w-32"><Image src={product.image} alt={product.title} fill sizes="128px" className="object-contain p-2" /></Link>
        <div className="flex flex-1 flex-col justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{product.category}</p><Link href={`/loja/${product.slug}`} className="mt-1 block text-lg font-bold text-[#0A2E5D] hover:underline">{product.title}</Link><p className="mt-2 text-sm font-semibold text-gray-600">Preço a definir</p></div><div className="flex flex-wrap items-end justify-between gap-4"><label className="text-xs font-semibold text-gray-600">Quantidade<QuantityInput label={`Quantidade de ${product.title}`} quantity={itemQuantity} onCommit={(nextQuantity) => setQuantity(product.slug, nextQuantity)} /></label><button type="button" onClick={() => removeItem(product.slug)} className="text-sm font-semibold text-red-700 hover:underline">Remover</button></div></div>
      </li>)}</ul>
    </section>
    <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 lg:sticky lg:top-6"><h2 className="text-xl font-bold text-[#0A2E5D]">Resumo</h2><div className="mt-5 flex justify-between border-b border-gray-200 pb-5 text-sm"><span className="text-gray-600">Quantidade total</span><strong>{quantity}</strong></div><div className="flex justify-between gap-4 py-5"><span className="font-semibold">Subtotal</span><strong className="text-right text-[#0A2E5D]">A definir</strong></div><p className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-950">Os valores, frete e prazo serão exibidos quando o catálogo definitivo estiver pronto.</p><button type="button" disabled className="mt-5 w-full cursor-not-allowed rounded-lg bg-gray-200 px-5 py-3 font-semibold text-gray-500">Finalizar compra — em breve</button><Link href="/orcamento" className="mt-3 block rounded-lg border border-[#0A2E5D] px-5 py-3 text-center text-sm font-semibold text-[#0A2E5D] hover:bg-blue-50">Solicitar orçamento personalizado</Link><Link href="/loja" className="mt-5 block text-center text-sm font-semibold text-[#0A2E5D] hover:underline">Continuar comprando</Link></aside>
  </div>;
}
