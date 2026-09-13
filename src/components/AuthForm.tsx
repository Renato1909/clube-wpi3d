"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { authenticate } from "@/app/actions/auth";
import type { AuthMode } from "@/lib/auth/validation";

const inputStyle = "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#0A2E5D] focus:ring-2 focus:ring-[#0A2E5D]/15 disabled:bg-gray-50";
const labels = { login: "Entrar na loja", cadastro: "Criar minha conta", recuperar: "Enviar link de recuperação", redefinir: "Salvar nova senha" };

export default function AuthForm({ mode, enabled, next = "/loja" }: { mode: AuthMode; enabled: boolean; next?: string }) {
  const [state, action, pending] = useActionState(authenticate.bind(null, mode), {});
  const [showPassword, setShowPassword] = useState(false);
  const newPassword = mode === "cadastro" || mode === "redefinir";
  const linkQuery = `?next=${encodeURIComponent(next)}`;

  return <>
    {!enabled && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <strong>Contas em preparação.</strong> O cadastro e o login ainda não estão disponíveis. Você pode conhecer a <Link href="/previa-loja" className="font-semibold underline">prévia da loja</Link> enquanto finalizamos essa etapa.
    </div>}
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <fieldset disabled={!enabled || pending} className="min-w-0 space-y-5">
        <legend className="sr-only">{labels[mode]}</legend>
        {mode === "cadastro" && <div>
          <label htmlFor="nome" className="mb-2 block text-sm font-semibold">Nome completo</label>
          <input id="nome" name="nome" required minLength={2} maxLength={120} autoComplete="name" className={inputStyle} placeholder="Seu nome completo" />
        </div>}
        {mode !== "redefinir" && <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold">E-mail</label>
          <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" className={inputStyle} placeholder="voce@exemplo.com" />
        </div>}
        {mode !== "recuperar" && <>
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="senha" className="text-sm font-semibold">{newPassword ? "Crie sua senha" : "Senha"}</label>
              <button type="button" aria-pressed={showPassword} aria-controls="senha" onClick={() => setShowPassword(!showPassword)} className="rounded px-2 py-1 text-xs font-semibold text-[#0A2E5D] hover:underline">{showPassword ? "Ocultar senha" : "Mostrar senha"}</button>
            </div>
            <input id="senha" name="senha" type={showPassword ? "text" : "password"} required minLength={newPassword ? 8 : 1} maxLength={128} autoComplete={newPassword ? "new-password" : "current-password"} aria-describedby={newPassword ? "password-help" : undefined} className={inputStyle} />
            {newPassword && <p id="password-help" className="mt-2 text-xs leading-5 text-gray-500">Pelo menos 8 caracteres, incluindo letras e números.</p>}
          </div>
          {newPassword && <div>
            <label htmlFor="confirmacao" className="mb-2 block text-sm font-semibold">Confirme sua senha</label>
            <input id="confirmacao" name="confirmacao" type={showPassword ? "text" : "password"} required minLength={8} maxLength={128} autoComplete="new-password" className={inputStyle} />
          </div>}
        </>}
        <button type="submit" className="w-full rounded-lg bg-[#E53935] px-5 py-3 font-semibold text-white transition hover:bg-[#C62828] disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Aguarde..." : labels[mode]}</button>
      </fieldset>
      {state.error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm leading-6 text-red-800">{state.error}</p>}
      {state.message && <div role="status" className="rounded-lg bg-blue-50 p-4 text-sm leading-6 text-[#0A2E5D]">{state.message}{mode === "redefinir" && <Link href="/loja" className="mt-2 block font-semibold underline">Ir para a loja</Link>}</div>}
    </form>
    <div className="mt-6 space-y-4 text-center text-sm text-gray-600">
      {mode === "login" && <><p><Link href="/recuperar-senha" className="text-[#0A2E5D] underline-offset-4 hover:underline">Esqueci minha senha</Link></p><p>Ainda não tem conta? <Link href={`/cadastro${linkQuery}`} className="font-semibold text-[#0A2E5D] hover:underline">Cadastre-se</Link></p></>}
      {mode === "cadastro" && <p>Já tem uma conta? <Link href={`/login${linkQuery}`} className="font-semibold text-[#0A2E5D] hover:underline">Entrar</Link></p>}
      {(mode === "recuperar" || mode === "redefinir") && <Link href="/login" className="font-semibold text-[#0A2E5D] hover:underline">Voltar para o login</Link>}
    </div>
  </>;
}
