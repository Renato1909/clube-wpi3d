import type { Metadata } from "next";
import AuthPage from "@/components/AuthPage";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nova senha | Clube WPI3D" };
export default async function RedefinirPage() {
  await requireUser("/redefinir-senha");
  return <AuthPage mode="redefinir" />;
}
