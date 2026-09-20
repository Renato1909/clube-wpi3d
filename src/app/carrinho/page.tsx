import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartPage from "@/components/CartPage";
import { requireUser } from "@/lib/supabase/server";
import { getProducts } from "@/lib/products-server";

export const metadata: Metadata = { title: "Carrinho | Clube WPI3D", robots: { index: false, follow: false } };
export default async function CarrinhoPage() {
  await requireUser("/carrinho");
  const products = await getProducts();
  return <><Header /><main className="min-h-[70vh] bg-[#F4F6F8] px-5 py-10 text-gray-900 md:py-12"><div className="mx-auto max-w-6xl"><CartPage products={products} /></div></main><Footer /></>;
}
