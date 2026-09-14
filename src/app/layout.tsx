import type { Metadata } from "next";
import "./globals.css";
import CartProvider from "@/components/CartProvider";

export const metadata: Metadata = {
  title: "Clube WPI3D | Impressão 3D personalizada",
  description:
    "Clube WPI3D: impressão 3D personalizada para projetos, peças, protótipos e soluções sob medida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body><CartProvider>{children}</CartProvider></body>
    </html>
  );
}
