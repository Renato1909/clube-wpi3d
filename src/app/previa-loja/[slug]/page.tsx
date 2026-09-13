import { notFound, redirect } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { findProduct } from "@/lib/products";
import { supabaseConfig } from "@/lib/supabase/config";

export default async function ProductPreview({ params }: { params: Promise<{ slug: string }> }) {
  const product = findProduct((await params).slug);
  if (!product) notFound();
  if (supabaseConfig()) redirect(`/loja/${product.slug}`);
  return <ProductDetail product={product} preview />;
}
