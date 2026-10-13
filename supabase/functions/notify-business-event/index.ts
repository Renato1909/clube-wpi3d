import { createClient } from "https://esm.sh/@supabase/supabase-js@2.116.0";

import { matchesWebhookSecret, parseBusinessEvent } from "./payload.ts";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function asPositiveInteger(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!serviceRoleKey || !supabaseUrl) {
    return json({ error: "function_not_configured" }, 500);
  }

  const suppliedSecret = request.headers.get("x-clube-wpi3d-webhook-secret") ?? "";
  if (!/^[a-f0-9]{64}$/.test(suppliedSecret)) return json({ error: "unauthorized" }, 401);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: secretRow, error: secretError } = await supabase
    .from("business_webhook_secrets")
    .select("secret")
    .eq("key", "notify-business-event")
    .maybeSingle();
  if (secretError || !secretRow) return json({ error: "webhook_not_configured" }, 500);
  if (!matchesWebhookSecret(suppliedSecret, secretRow.secret)) {
    return json({ error: "unauthorized" }, 401);
  }

  let webhookBody: unknown;
  try {
    webhookBody = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const payload = parseBusinessEvent(webhookBody);
  if (!payload) return json({ error: "invalid_payload" }, 400);

  let readyQuote: { id: number; customer_name: string } | null = null;

  if (payload.table === "quotes") {
    const quoteId = asPositiveInteger(payload.record.id);
    if (!quoteId) return json({ error: "quote_id_missing" }, 400);

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("id,customer_name,submission_complete")
      .eq("id", quoteId)
      .maybeSingle();

    if (quoteError) return json({ error: "quote_lookup_failed" }, 500);

    if (!quote || quote.submission_complete !== true) {
      return json({ sent: 0, skipped: true, reason: "quote_not_ready" });
    }

    readyQuote = {
      id: quote.id,
      customer_name: quote.customer_name,
    };
  }

  const { data: admins, error: adminError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (adminError) {
    return json({ error: "admin_lookup_failed" }, 500);
  }

  const adminIds = (admins ?? []).map((admin) => admin.id as string);
  if (!adminIds.length) {
    return json({ sent: 0, skipped: true, reason: "no_admins" });
  }

  const { data: tokens, error: tokenError } = await supabase
    .from("push_tokens")
    .select("user_id, token")
    .in("user_id", adminIds);

  if (tokenError) {
    return json({ error: "token_lookup_failed" }, 500);
  }

  if (!tokens?.length) {
    return json({ sent: 0, skipped: true, reason: "no_admin_tokens" });
  }

  let title: string;
  let body: string;
  let notificationData: Record<string, unknown>;

  if (payload.table === "profiles") {
    const name = String(payload.record.full_name ?? "Novo cliente").trim() || "Novo cliente";
    const profileId = String(payload.record.id ?? "");
    if (!profileId) return json({ error: "profile_id_missing" }, 400);

    title = "Novo cliente cadastrado";
    body = `${name} acabou de criar uma conta.`;
    notificationData = {
      type: "new_customer",
      profileId,
    };
  } else {
    if (!readyQuote) return json({ error: "quote_not_ready" }, 409);

    title = `Novo pedido #${readyQuote.id}`;
    body = `${readyQuote.customer_name} enviou um novo pedido.`;
    notificationData = {
      type: "new_quote",
      quoteId: readyQuote.id,
    };
  }

  const messages = tokens.map(({ token }) => ({
    to: token,
    sound: "default",
    title,
    body,
    data: notificationData,
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

