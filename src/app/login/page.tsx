import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthPage from "@/components/AuthPage";
import { currentUser } from "@/lib/supabase/server";
import { safeDestination } from "@/lib/auth/validation";

export const metadata: Metadata = { title: "Entrar | Clube WPI3D" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string; confirmado?: string }> }) {
  const params = await searchParams;
  const next = safeDestination(params.next);
  if (await currentUser()) redirect(next);
  return <AuthPage mode="login" next={next} error={params.erro === "confirmacao"} confirmed={params.confirmado === "1"} />;
}
