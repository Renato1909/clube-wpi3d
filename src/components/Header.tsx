import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-sm font-bold tracking-widest text-[#0A2E5D]">
            CLUBE
          </span>

          <span className="text-2xl font-bold">
            <span className="text-[#0A2E5D]">WPI</span>
            <span className="text-[#E53935]">3D</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 transition hover:text-[#0A2E5D]"
          >
            Início
          </Link>

          <Link
            href="#como-funciona"
            className="text-sm font-medium text-gray-700 transition hover:text-[#0A2E5D]"
          >
            Como funciona
          </Link>

          <Link
            href="#contato"
            className="text-sm font-medium text-gray-700 transition hover:text-[#0A2E5D]"
          >
            Contato
          </Link>

          <Link
            href="/orcamento"
            className="rounded-lg bg-[#E53935] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C62828]"
          >
            Solicitar orçamento
          </Link>
        </nav>
      </div>
    </header>
  );
}