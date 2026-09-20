import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseConfig } from "@/lib/supabase/config";
import { getProducts } from "@/lib/products-server";
import StorePage from "@/components/StorePage";

export const metadata: Metadata = { title: "Prévia da loja | Clube WPI3D", robots: { index: false, follow: false } };
export default async function PreviewPage() {
  if (supabaseConfig()) redirect("/loja");
  const products = await getProducts();
  return <StorePage preview products={products} />;
}
