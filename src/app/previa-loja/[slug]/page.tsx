import { notFound, redirect } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { getProductBySlug } from "@/lib/products-server";
import { supabaseConfig } from "@/lib/supabase/config";

export default async function ProductPreview({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  if (supabaseConfig()) redirect(`/loja/${product.slug}`);
  return <ProductDetail product={product} preview />;
}
