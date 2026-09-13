import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteForm from "@/components/QuoteForm";
import { supabaseConfig } from "@/lib/supabase/config";
import { requireUser } from "@/lib/supabase/server";
import { findProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "Solicite seu orçamento | Clube WPI3D",
  description: "Conte sua ideia e prepare uma solicitação de impressão 3D personalizada.",
};

export default async function OrcamentoPage({ searchParams }: { searchParams: Promise<{ produto?: string }> }) {
  const user = supabaseConfig() ? await requireUser("/orcamento") : null;
  const product = findProduct((await searchParams).produto ?? "");
  return (
    <>
      <Header />
      <main className="bg-[#F4F6F8] py-10 text-gray-900 md:py-16">
        <div className="mx-auto max-w-4xl px-5 md:px-6">
          <Link href="/" className="text-sm font-medium text-[#0A2E5D] underline-offset-4 hover:underline">← Voltar ao início</Link>
          <div className="mb-10 mt-8 text-center">
            <p className="font-semibold uppercase tracking-wider text-[#E53935]">Da ideia à impressão</p>
            <h1 className="mt-3 text-4xl font-bold text-[#0A2E5D] md:text-5xl">Solicite seu orçamento</h1>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">Conte o que você quer criar. Detalhes, medidas e referências ajudam a entender seu projeto — tudo bem se você ainda não tiver um modelo 3D.</p>
          </div>
          <QuoteForm key={product?.slug ?? "personalizado"} initialDescription={product ? `Gostaria de uma peça parecida com ${product.title}. ` : ""} initialName={typeof user?.user_metadata.full_name === "string" ? user.user_metadata.full_name : ""} initialEmail={user?.email ?? ""} />
        </div>
      </main>
      <Footer />
    </>
  );
}
