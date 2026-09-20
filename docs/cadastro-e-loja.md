# Cadastro, login e loja

## Fluxo

Home → Criar conta → Confirmar e-mail → Loja.

Quem já tem cadastro usa `/login`. A conta autenticada pode abrir `/loja`, os detalhes dos produtos, `/carrinho`, `/minha-conta` e `/orcamento`. O servidor verifica a identidade pelo Supabase antes de renderizar as páginas protegidas. A sessão usa cookies e é renovada pelo `src/proxy.ts`. Os destinos após login são limitados a rotas conhecidas.

Também foram preparados recuperação de senha, definição de nova senha, confirmação por link e encerramento da sessão neste navegador. A senha é processada pelo Supabase Auth; não é salva em arquivos, tabelas próprias ou localStorage.

## O que está disponível agora

Sem as variáveis do Supabase, os formulários de autenticação ficam desabilitados. Não há conta ou login fictício. `/loja` e `/minha-conta` encaminham ao login. `/previa-loja` permite revisar o catálogo com um aviso explícito de demonstração; quando o Supabase for configurado, essa rota passa a encaminhar para a loja protegida.

O catálogo vem da tabela `products` do Supabase (`supabase/products.sql`), com busca, categorias e detalhes; sem conexão ou sem linhas, o site usa o catálogo provisório embutido em `src/lib/products.ts`. Enquanto um produto estiver com preço a definir, o botão de compra fica indisponível e o carrinho mostra “Preço a definir”; com preço definido, o carrinho calcula o subtotal. O cliente autenticado pode adicionar peças ao carrinho, alterar quantidades, remover itens e manter a seleção salva neste navegador. A finalização da compra permanece indisponível até o pagamento ser liberado. O carrinho oferece acesso ao orçamento personalizado.

## Conectar o Supabase

1. Criar um projeto do Clube WPI3D no painel do Supabase.
2. Copiar `.env.example` para `.env.local`. Preencher `NEXT_PUBLIC_SUPABASE_URL` com a URL do projeto e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` com a chave publicável obtidas no painel. Nunca usar chave `secret` ou `service_role` nessas variáveis.
3. Definir `NEXT_PUBLIC_SITE_URL` com a origem usada para abrir o site. Para o teste local, usar `http://localhost:3000` de forma consistente, inclusive nos links enviados por e-mail.
4. Em Authentication, habilitar o provedor Email e manter confirmação de e-mail. Configurar Site URL com a mesma origem e permitir a URL de redirecionamento `http://localhost:3000/auth/callback**` no ambiente local. Na publicação, cadastrar a origem HTTPS real e os redirecionamentos correspondentes.
4b. Executar no SQL Editor, nesta ordem: `supabase/schema.sql` (contas, orçamentos, anexos), `supabase/admin-access.sql` (papel administrativo) e `supabase/products.sql` (catálogo). Para habilitar o painel `/admin`, promova a conta com `update public.profiles set role = 'admin' where id = '<uuid confirmado>';`.
5. Para confirmação que também funcione em outro navegador, configurar o link do template Confirm signup como `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`. Para o template Reset password, usar `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`. A rota `/auth/callback` também aceita a troca de código PKCE dos templates padrão no navegador original.
6. Reiniciar o servidor local. Em produção, gerar uma nova compilação com as variáveis corretas.
7. Testar cadastro, confirmação, login, acesso direto à loja, recuperação e saída com uma conta de teste. Os testes reais de e-mail dependem do serviço de envio configurado no Supabase; configurar SMTP apropriado antes de disponibilizar ao público.

Não é necessário criar tabela própria para o cadastro básico: o Supabase Auth mantém a conta e o nome informado fica nos metadados do usuário. Endereços, pedidos e orçamentos serão implementados posteriormente em tabelas protegidas por políticas de acesso. Metadados editáveis pelo usuário nunca devem definir permissões de administrador.

## Verificações

`npm test` valida dados de autenticação e bloqueio de destinos externos. `npm run lint` analisa o código e `npm run build` verifica tipos e compilação. Os testes usam o suporte nativo a TypeScript do Node.js 24.

A verificação sem um projeto Supabase cobre a interface, o catálogo e o bloqueio de acesso sem sessão. Ela não comprova ainda a entrega de e-mail, a criação de conta, a renovação de sessão ou a recuperação em um projeto real.

Referências: [Supabase com Next.js e cookies](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [autenticação com senha](https://supabase.com/docs/guides/auth/passwords).
