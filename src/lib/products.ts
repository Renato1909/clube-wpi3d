export const products = [
  { slug: "peca-religiosa", title: "Peça religiosa", category: "Arte religiosa", image: "/produtos/produto-01.jpeg", description: "Uma referência do trabalho do Clube WPI3D para quem busca uma peça de arte religiosa personalizada." },
  { slug: "peca-decorativa", title: "Peça decorativa", category: "Decoração", image: "/produtos/produto-02.jpeg", description: "Uma das criações do Clube WPI3D para inspirar a decoração do seu espaço." },
  { slug: "estatua-personalizada", title: "Estátua personalizada", category: "Decoração", image: "/produtos/produto-03.jpeg", description: "Conheça uma das estátuas produzidas em impressão 3D pelo Clube WPI3D." },
] as const;

export type Product = (typeof products)[number];

export function findProduct(slug: string) { return products.find((product) => product.slug === slug); }
