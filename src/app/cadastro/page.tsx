import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthPage from "@/components/AuthPage";
import { currentUser } from "@/lib/supabase/server";
import { safeDestination } from "@/lib/auth/validation";

export const metadata: Metadata = { title: "Criar conta | Clube WPI3D" };

export default async function CadastroPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeDestination((await searchParams).next);
  if (await currentUser()) redirect(next);
  return <AuthPage mode="cadastro" next={next} />;
}
