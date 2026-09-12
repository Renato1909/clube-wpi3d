export default function Footer() {
  return (
    <footer id="contato" className="bg-[#0A2E5D] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold tracking-widest text-white">
                CLUBE
              </span>

              <span className="text-2xl font-bold">
                WPI<span className="text-[#E53935]">3D</span>
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-300">
              by Work Play Internet
            </p>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-300">
              Impressão 3D personalizada para projetos, peças, protótipos e
              soluções sob medida.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Contato</h3>

            <div className="mt-3 space-y-2 text-sm text-gray-300">
              <p>WhatsApp</p>
              <p>E-mail</p>
              <p>Instagram</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-sm text-gray-300">
          © 2026 Clube WPI3D. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}