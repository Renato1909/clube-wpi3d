import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseConfig } from "@/lib/supabase/config";
import StorePage from "@/components/StorePage";

export const metadata: Metadata = { title: "Prévia da loja | Clube WPI3D", robots: { index: false, follow: false } };
export default function PreviewPage() {
  if (supabaseConfig()) redirect("/loja");
  return <StorePage preview />;
}
