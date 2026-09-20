export type Product = {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  /** Preço em centavos; null enquanto o valor não foi definido. */
  priceCents: number | null;
};

// Catálogo provisório usado quando o Supabase não está configurado
// ou a tabela products ainda não foi carregada no banco.
export const fallbackProducts: readonly Product[] = [
  {
    slug: "peca-religiosa",
    title: "Peça religiosa",
    category: "Arte religiosa",
    image: "/produtos/produto-01.jpeg",
    description:
      "Uma referência do trabalho do Clube WPI3D para quem busca uma peça de arte religiosa personalizada.",
    priceCents: null,
  },
  {
    slug: "peca-decorativa",
    title: "Peça decorativa",
    category: "Decoração",
    image: "/produtos/produto-02.jpeg",
    description:
      "Uma das criações do Clube WPI3D para inspirar a decoração do seu espaço.",
    priceCents: null,
  },
  {
    slug: "estatua-personalizada",
    title: "Estátua personalizada",
    category: "Decoração",
    image: "/produtos/produto-03.jpeg",
    description:
      "Conheça uma das estátuas produzidas em impressão 3D pelo Clube WPI3D.",
    priceCents: null,
  },
];

export function findProduct(slug: string, catalog: readonly Product[] = fallbackProducts): Product | undefined {
  return catalog.find((product) => product.slug === slug);
}

export function productPrice(product: Product): string {
  return product.priceCents === null
    ? "Preço a definir"
    : (product.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

