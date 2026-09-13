import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeDestination } from "@/lib/auth/validation";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeDestination(request.nextUrl.searchParams.get("next"));
  const client = await createClient();
  if (code && client) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
    if (error.code === "pkce_code_verifier_not_found" || error.code === "bad_code_verifier") {
      const login = new URL("/login", request.url);
      login.searchParams.set("confirmado", "1");
      login.searchParams.set("next", next);
      return NextResponse.redirect(login);
    }
  }
  return NextResponse.redirect(new URL("/login?erro=confirmacao", request.url));
}
