import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreCatalog from "@/components/StoreCatalog";

export default function StorePage({ preview = false, name }: { preview?: boolean; name?: string }) {
  return <><Header /><main className="bg-[#F4F6F8] px-5 py-8 text-gray-900 md:py-12"><div className="mx-auto max-w-6xl">
    {preview && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Prévia da loja.</strong> Você está vendo o catálogo sem uma conta. Os nomes são provisórios e os preços ainda serão definidos. Cadastro, pedidos e pagamentos não estão ativos. <Link href="/cadastro" className="font-semibold underline">Ver tela de cadastro</Link></div>}
    <section className="mb-10 rounded-3xl bg-[#0A2E5D] px-6 py-9 text-white md:p-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Loja Clube WPI3D</p>
      <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">{name ? `Olá, ${name}. Encontre sua próxima ideia.` : "Peças que dão forma às suas ideias."}</h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100">Explore nossas criações ou conte o que você tem em mente para um projeto personalizado.</p>
      <Link href="/orcamento" className="mt-6 inline-block rounded-lg bg-[#E53935] px-5 py-3 text-sm font-semibold hover:bg-[#C62828]">Quero um projeto personalizado</Link>
    </section>
    <StoreCatalog preview={preview} />
    <aside className="mt-10 flex flex-col justify-between gap-5 rounded-2xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center"><div><h2 className="text-lg font-bold text-[#0A2E5D]">Não encontrou o que imaginava?</h2><p className="mt-2 text-sm leading-6 text-gray-600">Envie sua ideia e referências pelo formulário de orçamento.</p></div><Link href="/orcamento" className="shrink-0 font-semibold text-[#0A2E5D] hover:underline">Solicitar orçamento →</Link></aside>
  </div></main><Footer /></>;
}
