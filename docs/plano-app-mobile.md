# Plano do aplicativo móvel — Clube WPI3D

## Decisões registradas

- Plataforma: **aplicativo móvel de verdade (Android e iOS) com Expo (React Native)**.
- O app **reaproveita o backend atual**: mesmo projeto Supabase (Auth, banco, Storage), mesmas políticas de RLS.
- O site Next.js existente continua como vitrine e painel administrativo; o app é o canal do cliente.

## Stack proposta

| Camada | Escolha | Motivo |
| --- | --- | --- |
| Framework | Expo (SDK atual) + expo-router | Navegação por arquivos, próxima do app router do Next.js já usado |
| Linguagem | TypeScript | Mesma linguagem e padrões do repositório |
| Supabase | `@supabase/supabase-js` + `expo-secure-store` para sessão | Mesma API já usada no site; token guardado com segurança |
| Estilo | NativeWind (Tailwind) | Reaproveita o conhecimento de Tailwind 4 do projeto |
| Upload | expo-document-picker + expo-file-system | Anexos de orçamento (STL, 3MF, OBJ, imagens, PDF, vídeo) |
| Estado | Context simples + MMKV/AsyncStorage | Espelha o carrinho persistente do site |
| Qualidade | ESLint + jest-expo (ou Vitest para lógica pura) | Reutiliza a validação de carrinho/auth como testes compartilhados |

Local no repositório: nova pasta `mobile/` na raiz (package.json próprio). Migração para monorepo (workspaces) só quando o compartilhamento de código ficar pesado.

## O que o app herda sem retrabalho

- Autenticação por e-mail/senha, confirmação e recuperação (Supabase Auth).
- Tabelas `profiles`, `quotes`, `quote_files` com RLS e `storage` bucket `quote-files` (20 MB).
- Fluxo de status do orçamento: recebido → em_analise → aguardando_cliente → aprovado/recusado → concluido.
- Papéis `customer`/`admin` via `private.is_admin()` (branch `feat/painel-administrativo`).

## Trabalho prévio recomendado (site)

1. Mesclar `feat/painel-administrativo` na `main` (painel admin já funcional e documentado).
2. Mover o catálogo provisório (`src/lib/products.ts`) para uma tabela `products` no Supabase com leitura pública e escrita admin — web e app passam a ler a mesma fonte; habilita preço e disponibilidade reais.
3. Concluir a integração real do `/orcamento` (envio + confirmação), pois o app consumirá o mesmo fluxo.

## Fases do app

### Fase 1 — MVP (cliente)
- Cadastro, login, confirmação de e-mail por **deep link** (esquema `clubewpi3d://`), recuperação de senha.
- Catálogo com busca e categorias; detalhe do produto.
- Carrinho local persistente (mesmas regras de `src/lib/cart.ts`: slug válido, quantidade 1–99).
- Orçamento: formulário + upload real para `quote-files` no caminho `{user_id}/`, com limite de 5 arquivos × 20 MB e MIME validado no servidor (Edge Function ou validação via bucket).
- Minha conta: perfil (nome, telefone), meus orçamentos com status, sair.

### Fase 2 — Engajamento
- Notificações push (expo-notifications + Edge Function disparada na mudança de status).
- Pagamentos (Pix/cartão via Mercado Pago ou Stripe) após precificação.
- Histórico de pedidos e acompanhamento de produção.

### Fase 3 — Expansão
- Modo offline básico (catálogo cacheado).
- Painel admin simplificado no app (opcional; o admin completo permanece no site).
- Avaliações e fotos de peças entregues.

## Ajustes necessários no Supabase

- Tabela `products` (slug único, título, categoria, descrição, imagem, preço nulo até definir, ativo) com RLS: leitura pública, escrita admin.
- Tabela `push_tokens` (user_id, token, plataforma) escrita apenas pelo próprio usuário.
- Edge Functions: `notify-status-change` (push + e-mail) e validação de upload.
- Adicionar `clubewpi3d://auth/**` (e deep links universais, se usado domínio) aos redirect URLs do Auth.

## Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Links de e-mail abrindo no app do celular | Deep link + fallback para o site; testar nos dois provedores |
| Arquivos 3D grandes no celular | Limite mantido (20 MB); validação de tamanho antes do upload |
| Chaves expostas no app | Somente chave publicável; tudo sensível em Edge Functions com `service_role` |
| Catálogo divergente entre site e app | Fonte única na tabela `products` |

## Verificar por fase

- Fase 1: cadastro/confirmar/login/recuperar no dispositivo real; upload STL válido e um inválido; carrinho sobrevive à reinstalação? (decidir: não — sessão sim, carrinho segue o navegador/dispositivo).
- CI: `npm run lint` e `npm run build` do site continuam verdes; app entra no pipeline com `expo-doctor`, lint e testes.
