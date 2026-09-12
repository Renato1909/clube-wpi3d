import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}