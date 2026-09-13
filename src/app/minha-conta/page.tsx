import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient, requireUser } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

const statusLabels: Record<string, string> = {
  recebido: "Recebido",
  em_analise: "Em análise",
  aguardando_cliente: "Aguardando você",
  aprovado: "Aprovado",
  recusado: "Não aprovado",
  concluido: "Concluído",
};

export const metadata: Metadata = { title: "Minha conta | Clube WPI3D", robots: { index: false, follow: false } };
export default async function ContaPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const user = await requireUser("/minha-conta");
  const params = await searchParams;
  const client = await createClient();
  const { data: quotes } = client ? await client.from("quotes")
    .select("id, description, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10) : { data: null };
  return <><Header /><main className="bg-[#F4F6F8] px-5 py-12 text-gray-900"><div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 md:p-10">
    <h1 className="text-3xl font-bold text-[#0A2E5D]">Minha conta</h1><p className="mt-3 text-gray-600">Seu acesso ao Clube WPI3D.</p>
    <dl className="my-8 space-y-5"><div><dt className="text-sm text-gray-500">Nome</dt><dd className="mt-1 font-semibold">{typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : "Não informado"}</dd></div><div><dt className="text-sm text-gray-500">E-mail</dt><dd className="mt-1 break-all font-semibold">{user.email}</dd></div></dl>
    <div className="flex flex-wrap gap-3"><Link href="/loja" className="rounded-lg bg-[#0A2E5D] px-5 py-3 font-semibold text-white">Ir para a loja</Link><Link href="/orcamento" className="rounded-lg border border-[#0A2E5D] px-5 py-3 font-semibold text-[#0A2E5D]">Solicitar orçamento</Link></div>
    <section aria-labelledby="quotes-heading" className="mt-10 border-t border-gray-200 pt-8">
      <h2 id="quotes-heading" className="text-2xl font-bold text-[#0A2E5D]">Meus orçamentos</h2>
      {quotes && quotes.length > 0 ? <ul className="mt-5 space-y-3">{quotes.map((quote) => <li key={quote.id} className="rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><strong>Solicitação nº {quote.id}</strong><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0A2E5D]">{statusLabels[quote.status] ?? quote.status}</span></div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{quote.description}</p>
        <p className="mt-2 text-xs text-gray-500">Enviado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(quote.created_at))}</p>
      </li>)}</ul> : <p className="mt-4 text-sm leading-6 text-gray-600">Você ainda não enviou um orçamento.</p>}
    </section>
    {params.erro === "sair" && <p role="alert" className="mt-4 text-sm text-red-700">Não foi possível sair agora. Tente novamente.</p>}
    <form action={signOut} className="mt-6"><button className="text-sm font-semibold text-red-700 hover:underline">Sair da conta</button></form>
  </div></main><Footer /></>;
}
