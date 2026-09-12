import Image from "next/image";

const products = [
  {
    src: "/produtos/produto-01.jpeg",
    alt: "Peça religiosa produzida pelo Clube WPI3D",
    title: "Projetos personalizados",
  },
  {
    src: "/produtos/produto-02.jpeg",
    alt: "Peça decorativa produzida pelo Clube WPI3D",
    title: "Impressão com detalhes",
  },
  {
    src: "/produtos/produto-03.jpeg",
    alt: "Estátua produzida pelo Clube WPI3D",
    title: "Peças decorativas",
  },
];

export default function ProductShowcase() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="font-semibold uppercase tracking-wider text-[#E53935]">
            Nossos trabalhos
          </p>

          <h2 className="mt-3 text-4xl font-bold text-[#0A2E5D]">
            Conheça algumas de nossas criações
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">
            Veja alguns projetos produzidos pelo Clube WPI3D com impressão 3D
            personalizada.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.src}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-3/4 bg-[#F4F6F8]">
                <Image
                  src={product.src}
                  alt={product.alt}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-[#0A2E5D]">
                  {product.title}
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  Produzido pelo Clube WPI3D.
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}