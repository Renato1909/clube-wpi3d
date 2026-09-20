import type { Metadata } from "next";
import "./globals.css";
import CartProvider from "@/components/CartProvider";
import { getProducts } from "@/lib/products-server";

export const metadata: Metadata = {
  title: "Clube WPI3D | Impressão 3D personalizada",
  description:
    "Clube WPI3D: impressão 3D personalizada para projetos, peças, protótipos e soluções sob medida.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const products = await getProducts();

  return (
    <html lang="pt-BR">
      <body><CartProvider products={products}>{children}</CartProvider></body>
    </html>
  );
}
