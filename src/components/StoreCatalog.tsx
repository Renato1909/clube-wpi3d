"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { products } from "@/lib/products";
import AddToCartButton from "@/components/AddToCartButton";

function normalize(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

export default function StoreCatalog({ preview = false }: { preview?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const filtered = products.filter((product) => (category === "Todos" || product.category === category) && normalize(`${product.title} ${product.category}`).includes(normalize(query.trim())));
  return <section aria-labelledby="catalog-title">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div><h2 id="catalog-title" className="text-2xl font-bold text-[#0A2E5D]">Explore nossas peças</h2><p className="mt-2 text-sm text-gray-600">Encontre uma inspiração para o seu próximo projeto.</p></div>
      <div className="w-full md:max-w-xs"><label htmlFor="busca" className="mb-2 block text-xs font-semibold text-gray-600">Buscar produtos</label><input id="busca" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O que você está procurando?" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0A2E5D] focus:ring-2 focus:ring-[#0A2E5D]/15" /></div>
    </div>
    <div className="my-6 flex flex-wrap gap-2" aria-label="Filtrar por categoria">
      {["Todos", "Arte religiosa", "Decoração"].map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${category === item ? "border-[#0A2E5D] bg-[#0A2E5D] text-white" : "border-gray-300 bg-white text-gray-600 hover:border-[#0A2E5D]"}`}>{item}</button>)}
    </div>
    <p role="status" className="mb-4 text-xs text-gray-500">{filtered.length} produto(s) encontrado(s)</p>
    {filtered.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((product) => <article key={product.slug} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <Link href={`${preview ? "/previa-loja" : "/loja"}/${product.slug}`} className="group block">
          <div className="relative aspect-square bg-[#EEF1F5]"><Image src={product.image} alt={product.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain p-5 transition group-hover:scale-105" /></div>
          <div className="px-5 pt-5"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{product.category}</p><h3 className="mt-2 text-xl font-bold text-[#0A2E5D]">{product.title}</h3><p className="mt-4 font-semibold text-gray-700">Preço a definir</p><span className="mt-4 block text-sm font-semibold text-[#0A2E5D] group-hover:underline">Ver detalhes →</span></div>
        </Link>
        <div className="p-5">{preview ? <p className="text-center text-xs text-gray-500">Compra disponível após o cadastro</p> : <AddToCartButton slug={product.slug} compact />}</div>
      </article>)}
    </div> : <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center"><h3 className="font-bold text-[#0A2E5D]">Nenhum produto encontrado</h3><p className="mt-2 text-sm text-gray-600">Tente outra busca ou veja todas as categorias.</p><button onClick={() => { setQuery(""); setCategory("Todos"); }} className="mt-5 font-semibold text-[#0A2E5D] underline">Limpar filtros</button></div>}
  </section>;
}
