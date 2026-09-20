import { createClient } from "https://esm.sh/@supabase/supabase-js@2.116.0";

const statusLabels: Record<string, string> = {
  recebido: "Recebido",
  em_analise: "Em análise",
  aguardando_cliente: "Aguardando sua resposta",
  aprovado: "Aprovado",
  recusado: "Recusado",
  concluido: "Concluído",
};

type Payload = {
  quote_id: number;
  status: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!serviceRoleKey || !supabaseUrl) return json({ error: "function_not_configured" }, 500);

  const authorization = request.headers.get("Authorization") ?? "";
  if (authorization !== `Bearer ${serviceRoleKey}`) {
    return json({ error: "unauthorized" }, 401);
  }

  let payload: Payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  if (!Number.isSafeInteger(payload.quote_id) || payload.quote_id < 1 || !statusLabels[payload.status]) {
    return json({ error: "invalid_payload" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id, user_id, status")
    .eq("id", payload.quote_id)
    .maybeSingle();

  if (quoteError) return json({ error: "quote_lookup_failed" }, 500);
  if (!quote) return json({ error: "quote_not_found" }, 404);

  const { data: tokens, error: tokenError } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("user_id", quote.user_id);

  if (tokenError) return json({ error: "token_lookup_failed" }, 500);
  if (!tokens?.length) return json({ sent: 0, skipped: true });

  const messages = tokens.map(({ token }) => ({
    to: token,
    sound: "default",
    title: `Orçamento #${quote.id} atualizado`,
    body: `Status: ${statusLabels[payload.status]}`,
    data: { quoteId: quote.id, status: payload.status },
  }));

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    return json({ error: "expo_push_failed", status: response.status }, 502);
  }

  const result = await response.json();
  return json({ sent: messages.length, result });
});
