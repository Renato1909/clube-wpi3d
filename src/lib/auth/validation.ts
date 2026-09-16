export type AuthMode = "login" | "cadastro" | "recuperar" | "redefinir";
export type AuthState = { error?: string; message?: string };

// Only known destinations may be used after authentication.
export function safeDestination(value: unknown): string {
  return typeof value === "string" && ["/loja", "/minha-conta", "/orcamento", "/redefinir-senha", "/carrinho"].includes(value) ? value : "/loja";
}

export function validateAuth(mode: AuthMode, data: FormData): string | null {
  const email = String(data.get("email") ?? "").trim();
  const password = String(data.get("senha") ?? "");
  if (mode !== "redefinir" && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return "Informe um e-mail válido.";
  if (mode === "recuperar") return null;
  if (!password || password.length > 128) return "Informe sua senha (até 128 caracteres).";
  if (mode === "cadastro" || mode === "redefinir") {
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) return "Use uma senha com pelo menos 8 caracteres, incluindo letras e números.";
    if (password !== data.get("confirmacao")) return "As senhas não coincidem.";
  }
  if (mode === "cadastro") {
    const name = String(data.get("nome") ?? "").trim();
    if (name.length < 2 || name.length > 120) return "Informe seu nome completo (de 2 a 120 caracteres).";
  }
  return null;
}
