import { createClient } from "@/lib/supabase/server";
import { fallbackProducts, type Product } from "./products";

type ProductRow = {
  slug: string;
  title: string;
  category: string;
  description: string;
  image_path: string;
  price_cents: number | null;
};

function toProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    description: row.description,
    image: row.image_path,
    priceCents: row.price_cents,
  };
}

// Lê o catálogo ativo na tabela products. Sem Supabase configurado ou sem
// linhas disponíveis, devolve o catálogo provisório embutido.
export async function getProducts(): Promise<readonly Product[]> {
  const client = await createClient();
  if (!client) return fallbackProducts;
  const { data, error } = await client
    .from("products")
    .select("slug, title, category, description, image_path, price_cents")
    .eq("active", true)
    .order("sort_order")
    .order("title");
  if (error || !data || data.length === 0) return fallbackProducts;
  return data.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const client = await createClient();
  if (client) {
    const { data, error } = await client
      .from("products")
      .select("slug, title, category, description, image_path, price_cents")
      .eq("active", true)
      .eq("slug", slug)
      .maybeSingle();
    if (!error && data) return toProduct(data);
  }
  return fallbackProducts.find((product) => product.slug === slug);
}
