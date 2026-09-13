import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const client = await createClient();
  if (token_hash && client && (type === "signup" || type === "recovery")) {
    const { error } = await client.auth.verifyOtp({ token_hash, type });
    if (!error) return NextResponse.redirect(new URL(type === "recovery" ? "/redefinir-senha" : "/loja", request.url));
  }
  return NextResponse.redirect(new URL("/login?erro=confirmacao", request.url));
}
