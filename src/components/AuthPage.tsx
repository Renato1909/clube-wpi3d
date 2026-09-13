import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";
import { supabaseConfig } from "@/lib/supabase/config";
import type { AuthMode } from "@/lib/auth/validation";

const copy = {
  cadastro: { title: "Seu próximo projeto começa aqui.", form: "Crie sua conta", description: "Cadastre-se para entrar na loja do Clube WPI3D e encontrar a próxima peça para sua ideia." },
  login: { title: "Bom ter você por aqui.", form: "Entre na sua conta", description: "Acesse a loja, descubra nossas peças e dê continuidade aos seus projetos de impressão 3D." },
  recuperar: { title: "Vamos recuperar seu acesso.", form: "Esqueceu sua senha?", description: "Informe o e-mail do cadastro. Enviaremos um link para você escolher uma nova senha." },
  redefinir: { title: "Um novo acesso às suas ideias.", form: "Defina uma nova senha", description: "Escolha uma senha para continuar acessando sua conta e a loja." },
};

export default function AuthPage({ mode, next, error, confirmed }: { mode: AuthMode; next?: string; error?: boolean; confirmed?: boolean }) {
  const content = copy[mode];
  return <><Header /><main className="bg-[#F4F6F8] px-5 py-10 text-gray-900 md:py-16">
    <div className="mx-auto max-w-6xl">
      <Link href="/" className="text-sm font-medium text-[#0A2E5D] hover:underline">← Voltar ao início</Link>
      <div className="mt-6 grid overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm lg:grid-cols-2">
        <section className="bg-[#0A2E5D] p-7 text-white md:p-12 lg:flex lg:flex-col lg:justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Bem-vindo ao Clube WPI3D</p>
          <h1 className="mt-5 max-w-md text-3xl font-bold leading-tight md:text-4xl">{content.title}</h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-blue-100">{content.description}</p>
          <ol className="mt-8 hidden space-y-5 border-t border-white/15 pt-8 text-sm lg:block">
            <li><span className="mr-3 font-bold text-red-300">01</span>Crie sua conta e confirme seu e-mail.</li>
            <li><span className="mr-3 font-bold text-red-300">02</span>Entre e conheça os produtos da loja.</li>
            <li><span className="mr-3 font-bold text-red-300">03</span>Escolha uma peça ou peça um orçamento.</li>
          </ol>
        </section>
        <section aria-labelledby="auth-heading" className="min-w-0 p-6 md:p-10">
          <h2 id="auth-heading" className="mb-6 text-2xl font-bold text-[#0A2E5D]">{content.form}</h2>
          {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-sm leading-6 text-red-800">Esse link não pôde ser confirmado ou já expirou. Tente entrar ou solicite um novo link em Esqueci minha senha.</p>}
          {confirmed && <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><strong>E-mail confirmado.</strong> Entre com a senha que você cadastrou para acessar a loja.</p>}
          <AuthForm mode={mode} enabled={Boolean(supabaseConfig())} next={next} />
        </section>
      </div>
    </div>
  </main><Footer /></>;
}
