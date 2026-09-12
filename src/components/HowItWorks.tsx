export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Envie sua ideia",
      description:
        "Conte o que você deseja produzir e envie imagens ou arquivos do projeto.",
    },
    {
      number: "02",
      title: "Receba seu orçamento",
      description:
        "Analisamos seu projeto e informamos o valor e as condições de entrega.",
    },
    {
      number: "03",
      title: "Produção",
      description:
        "Após a aprovação do orçamento, iniciamos a produção da sua peça.",
    },
    {
      number: "04",
      title: "Receba sua peça",
      description:
        "Seu produto é finalizado e entregue conforme as condições combinadas.",
    },
  ];

  return (
    <section id="como-funciona" className="bg-[#F4F6F8] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="font-semibold uppercase tracking-wider text-[#E53935]">
            Processo simples
          </p>

          <h2 className="mt-3 text-4xl font-bold text-[#0A2E5D]">
            Como funciona?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">
            Do envio da ideia até a entrega da peça, o Clube WPI3D acompanha
            cada etapa do processo.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-3xl font-bold text-[#E53935]">
                {step.number}
              </span>

              <h3 className="mt-5 text-xl font-bold text-[#0A2E5D]">
                {step.title}
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}