import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { productPrice, type Product } from "@/lib/products";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductDetail({ product, preview = false }: { product: Product; preview?: boolean }) {
  const price = productPrice(product);
  const hasPrice = product.priceCents !== null;
  return <><Header /><main className="bg-[#F4F6F8] px-5 py-10 text-gray-900"><div className="mx-auto max-w-6xl">
    <Link href={preview ? "/previa-loja" : "/loja"} className="text-sm font-semibold text-[#0A2E5D] hover:underline">← Voltar à loja</Link>
    {preview && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Prévia do catálogo. Nome provisório, preço a definir e compra ainda indisponível.</p>}
    <article className="mt-6 grid overflow-hidden rounded-3xl border border-gray-200 bg-white md:grid-cols-2">
      <div className="relative min-h-80 aspect-3/4 bg-[#EEF1F5]"><Image src={product.image} alt={product.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-6" priority /></div>
      <div className="flex flex-col justify-center p-6 md:p-10"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{product.category}</p><h1 className="mt-3 text-3xl font-bold text-[#0A2E5D]">{product.title}</h1><p className="mt-5 text-sm leading-7 text-gray-600">{product.description}</p>
        <dl className="my-7 divide-y divide-gray-100 border-y border-gray-100 text-sm"><div className="flex justify-between gap-4 py-4"><dt className="text-gray-500">Medidas e material</dt><dd className="text-right font-medium">A confirmar</dd></div><div className="flex justify-between gap-4 py-4"><dt className="text-gray-500">Disponibilidade</dt><dd className="font-medium">A confirmar</dd></div></dl>
        <p className="text-2xl font-bold text-[#0A2E5D]">{price}</p>
        {!hasPrice && <p className="mt-2 text-sm leading-6 text-gray-500">A compra será liberada após a definição do produto, do valor e das condições de entrega.</p>}
        {!preview && hasPrice && <div className="mt-6"><AddToCartButton slug={product.slug} /></div>}
        {preview && <button type="button" disabled className="mt-6 rounded-lg bg-gray-200 px-5 py-3 font-semibold text-gray-500">Comprar — em breve</button>}
        {!preview && !hasPrice && <button type="button" disabled className="mt-6 rounded-lg bg-gray-200 px-5 py-3 font-semibold text-gray-500">Adicionar ao carrinho — preço em definição</button>}
        <Link href={`/orcamento?produto=${product.slug}`} className="mt-3 rounded-lg border border-[#0A2E5D] px-5 py-3 text-center text-sm font-semibold text-[#0A2E5D] hover:bg-blue-50">Pedir orçamento de uma peça parecida</Link>
      </div>
    </article>
  </div></main><Footer /></>;
}
