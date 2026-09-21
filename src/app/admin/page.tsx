import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { updateQuoteStatus } from "@/app/actions/admin";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<string, string> = {
  recebido: "Recebido",
  em_analise: "Em análise",
  aguardando_cliente: "Aguardando cliente",
  aprovado: "Aprovado",
  recusado: "Recusado",
  concluido: "Concluído",
};

export const metadata: Metadata = { title: "Administração | Clube WPI3D", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ erro?: string; sucesso?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const client = await createClient();
  const { data: quotes, error } = client ? await client
    .from("quotes")
    .select("id, customer_name, customer_email, customer_phone, description, quantity, material, color, desired_date, notes, status, submission_complete, created_at, quote_files(id, original_name, storage_path, size_bytes)")
    .order("created_at", { ascending: false })
    .limit(100) : { data: null, error: new Error("Supabase indisponível") };

  return <><Header /><main className="min-h-[70vh] bg-[#F4F6F8] px-5 py-10 text-gray-900"><div className="mx-auto max-w-6xl">
    <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-wider text-[#E53935]">Área restrita</p><h1 className="mt-2 text-3xl font-bold text-[#0A2E5D] md:text-4xl">Painel administrativo</h1><p className="mt-3 text-gray-600">Acompanhe solicitações e atualize o andamento dos orçamentos.</p></div>
    {params.sucesso === "status" && <p role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">Status atualizado com sucesso.</p>}
    {params.erro && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Não foi possível concluir a alteração. Tente novamente.</p>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">Não foi possível carregar os orçamentos.</p>}
    {!error && quotes?.length === 0 && <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-600">Nenhum orçamento recebido até o momento.</div>}
    <div className="space-y-5">{quotes?.map((quote) => <article key={quote.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-gray-500">Solicitação nº {quote.id}</p><h2 className="mt-1 text-xl font-bold text-[#0A2E5D]">{quote.customer_name}</h2><p className="mt-1 text-sm text-gray-600">{quote.customer_email} · {quote.customer_phone}</p></div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0A2E5D]">{statusLabels[quote.status] ?? quote.status}</span>{!quote.submission_complete && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Envio incompleto</span>}</div></div>
      <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-gray-700">{quote.description}</p>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-gray-500">Quantidade</dt><dd className="font-semibold">{quote.quantity}</dd></div><div><dt className="text-gray-500">Material</dt><dd className="font-semibold">{quote.material}</dd></div><div><dt className="text-gray-500">Cor</dt><dd className="font-semibold">{quote.color || "Não informada"}</dd></div><div><dt className="text-gray-500">Prazo desejado</dt><dd className="font-semibold">{quote.desired_date || "Não informado"}</dd></div></dl>
      {quote.notes && <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700"><strong>Observações:</strong> {quote.notes}</p>}
      {quote.quote_files?.length > 0 && <div className="mt-5"><h3 className="text-sm font-bold text-[#0A2E5D]">Arquivos enviados</h3><ul className="mt-2 space-y-1 text-sm text-gray-600">{quote.quote_files.map((file) => <li key={file.id}>{file.original_name} · {(file.size_bytes / 1024 / 1024).toFixed(1)} MB</li>)}</ul></div>}
      <form action={updateQuoteStatus} className="mt-6 flex flex-wrap items-end gap-3 border-t border-gray-200 pt-5"><input type="hidden" name="quote_id" value={quote.id} /><label className="text-sm font-semibold text-gray-700">Alterar status<select name="status" defaultValue={quote.status} className="mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="rounded-lg bg-[#0A2E5D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#082448]">Salvar status</button></form>
      <p className="mt-4 text-xs text-gray-500">Recebido em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(quote.created_at))}</p>
    </article>)}</div>
  </div></main><Footer /></>;
}
