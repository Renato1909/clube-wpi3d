"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = new Set(["recebido", "em_analise", "aguardando_cliente", "aprovado", "recusado", "concluido"]);

export async function updateQuoteStatus(form: FormData) {
  await requireAdmin();

  const quoteId = Number(form.get("quote_id"));
  const status = String(form.get("status") ?? "");
  if (!Number.isSafeInteger(quoteId) || quoteId < 1 || !allowedStatuses.has(status)) {
    redirect("/admin?erro=dados");
  }

  const client = await createClient();
  if (!client) redirect("/admin?erro=conexao");

  const { error } = await client.from("quotes").update({ status }).eq("id", quoteId);
  if (error) redirect("/admin?erro=atualizar");

  revalidatePath("/admin");
  revalidatePath("/minha-conta");
  redirect("/admin?sucesso=status");
}
