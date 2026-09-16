import test from "node:test";
import assert from "node:assert/strict";
import { safeDestination, validateAuth } from "../src/lib/auth/validation.ts";

function form(values) { const data = new FormData(); for (const [key, value] of Object.entries(values)) data.set(key, value); return data; }

test("redirects reject external, protocol-relative, encoded and unexpected destinations", () => {
  for (const value of ["https://example.com", "//example.com", "/\\example.com", "/%2f%2fexample.com", "/admin", null, ["/minha-conta"]]) assert.equal(safeDestination(value), "/loja");
  for (const value of ["/loja", "/minha-conta", "/orcamento", "/redefinir-senha", "/carrinho"]) assert.equal(safeDestination(value), value);
});

test("signup validates name, email, password and confirmation on the server", () => {
  const valid = { nome: "Cliente Teste", email: "cliente@example.com", senha: "SenhaTeste123", confirmacao: "SenhaTeste123" };
  assert.equal(validateAuth("cadastro", form(valid)), null);
  for (const changes of [{ nome: "  " }, { email: "incorreto" }, { senha: "12345678", confirmacao: "12345678" }, { confirmacao: "outra" }, { senha: "x".repeat(129) }]) assert.ok(validateAuth("cadastro", form({ ...valid, ...changes })));
});

test("login accepts existing passwords without imposing signup rules", () => {
  assert.equal(validateAuth("login", form({ email: "cliente@example.com", senha: "existente" })), null);
  assert.ok(validateAuth("login", form({ email: "cliente@example.com", senha: "" })));
});

test("password recovery requires email; reset requires matching strong passwords", () => {
  assert.equal(validateAuth("recuperar", form({ email: "cliente@example.com" })), null);
  assert.ok(validateAuth("recuperar", form({ email: "" })));
  assert.equal(validateAuth("redefinir", form({ senha: "NovaSenha123", confirmacao: "NovaSenha123" })), null);
  assert.ok(validateAuth("redefinir", form({ senha: "NovaSenha123", confirmacao: "diferente" })));
});
