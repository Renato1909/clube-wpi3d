"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/supabase/config";
import { safeDestination, validateAuth, type AuthMode, type AuthState } from "@/lib/auth/validation";

export async function authenticate(mode: AuthMode, _previous: AuthState, form: FormData): Promise<AuthState> {
  if (!["login", "cadastro", "recuperar", "redefinir"].includes(mode)) return { error: "Operação inválida." };
  const invalid = validateAuth(mode, form);
  if (invalid) return { error: invalid };
  const client = await createClient();
  if (!client) return { error: "O acesso às contas ainda não está disponível. Tente novamente mais tarde." };
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("senha") ?? "");
  const destination = safeDestination(form.get("next"));
  try {
    if (mode === "cadastro") {
      const { data, error } = await client.auth.signUp({ email, password, options: {
        data: { full_name: String(form.get("nome")).trim() },
        emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(destination)}`,
      } });
      if (error) return { error: "Não foi possível concluir o cadastro. Confira os dados e tente novamente em alguns minutos. Se já tem uma conta, entre ou recupere a senha." };
      if (!data.session) return { message: "Confira seu e-mail para confirmar o cadastro e acessar a loja. Se já tem uma conta, use Entrar ou Esqueci minha senha." };
    } else if (mode === "login") {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { error: "Não foi possível entrar. Confira e-mail e senha e confirme seu cadastro pelo link enviado ao e-mail." };
    } else if (mode === "recuperar") {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl()}/auth/callback?next=/redefinir-senha` });
      if (error) return { error: "Não foi possível solicitar o link agora. Tente novamente em alguns minutos." };
      return { message: "Se houver uma conta com esse e-mail, você receberá um link para criar uma nova senha." };
    } else {
      const { data, error: authError } = await client.auth.getUser();
      if (authError || !data.user) return { error: "O acesso expirou. Solicite outro link em Esqueci minha senha." };
      const { error } = await client.auth.updateUser({ password });
      if (error) return { error: "Não foi possível atualizar a senha. Escolha uma senha diferente ou solicite um novo link." };
      return { message: "Senha atualizada. Você já pode continuar para a loja." };
    }
  } catch {
    return { error: "Não foi possível conectar agora. Tente novamente em alguns instantes." };
  }
  revalidatePath("/", "layout");
  redirect(destination);
}

export async function signOut(): Promise<void> {
  const client = await createClient();
  if (client) {
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) redirect("/minha-conta?erro=sair");
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
