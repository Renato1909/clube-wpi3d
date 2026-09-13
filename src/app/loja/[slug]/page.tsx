import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { requireUser } from "@/lib/supabase/server";
import { findProduct } from "@/lib/products";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireUser();
  const product = findProduct((await params).slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
