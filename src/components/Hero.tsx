import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid min-h-155 max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <p className="mb-4 font-semibold uppercase tracking-wider text-[#E53935]">
            Clube WPI3D
          </p>

          <h1 className="max-w-2xl text-5xl font-bold leading-tight text-[#0A2E5D] md:text-6xl">
            Suas ideias ganham forma aqui.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Impressão 3D personalizada para projetos, peças, protótipos e
            soluções criadas de acordo com a sua necessidade.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/cadastro" className="rounded-lg bg-[#0A2E5D] px-6 py-3 font-semibold text-white transition hover:bg-[#082448]">
              Criar conta e conhecer a loja
            </Link>
            <Link
              href="/orcamento"
              className="rounded-lg bg-[#E53935] px-6 py-3 font-semibold text-white transition hover:bg-[#C62828]"
            >
              Solicitar orçamento
            </Link>

            <a
              href="#como-funciona"
              className="rounded-lg border-2 border-[#0A2E5D] px-6 py-3 font-semibold text-[#0A2E5D] transition hover:bg-[#0A2E5D] hover:text-white"
            >
              Como funciona
            </a>
          </div>
        </div>

        <div className="flex min-h-100 items-center justify-center rounded-3xl bg-[#F4F6F8]">
          <div className="px-6 text-center">
            <p className="text-7xl">🧩</p>

            <p className="mt-4 font-semibold text-[#0A2E5D]">
              Em breve: projetos produzidos pelo Clube WPI3D
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
