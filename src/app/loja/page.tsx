import type { Metadata } from "next";
import StorePage from "@/components/StorePage";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Loja | Clube WPI3D", robots: { index: false, follow: false } };
export default async function LojaPage() {
  const user = await requireUser();
  const name = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name.trim().split(/\s+/)[0] : undefined;
  return <StorePage name={name} />;
}
