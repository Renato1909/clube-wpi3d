# Notificações operacionais do Clube WPI3D

O projeto envia push notifications para os dispositivos dos usuários com `profiles.role = 'admin'`.

## Eventos

- Inserção em `profiles`: **Novo cliente cadastrado**.
- Inserção em `quotes`: **Novo pedido #ID**.
- Alteração de status de orçamento: notificação enviada ao cliente pela função `notify-status-change`.

## Arquitetura

```
profiles/quotes INSERT
        ↓
Postgres trigger
        ↓
pg_net (assíncrono)
        ↓
notify-business-event
        ↓
Expo Push Service
        ↓
celular(es) do administrador
```

A função `notify-business-event` usa um segredo aleatório mantido somente no banco e validado por cabeçalho interno. A chave de serviço nunca é armazenada no aplicativo móvel nem no repositório.

## Configuração do banco

O fluxo já foi aplicado ao projeto Supabase:

- extensão `pg_net`;
- tabela `push_tokens`;
- tabela protegida `business_webhook_secrets`;
- triggers `business_webhook_profiles_insert` e `business_webhook_quotes_insert`.

A configuração reproduzível está em `supabase/business-push-notifications.sql`.

## Operação

O administrador precisa entrar no aplicativo móvel em um aparelho físico e aceitar as notificações. O aplicativo registra o Expo Push Token em `push_tokens`.

É possível registrar vários aparelhos para o mesmo administrador. Todos receberão os eventos.

## Teste

1. Instale um development build ou build de produção do app.
2. Faça login com uma conta cujo `profiles.role` seja `admin`.
3. Confirme que o dispositivo aparece em `push_tokens`.
4. Cadastre um novo cliente.
5. Confirme a notificação **Novo cliente cadastrado**.
6. Crie um pedido de cliente.
7. Confirme a notificação **Novo pedido #ID**.

O teste de integração do trigger de `quotes` já foi executado no ambiente Supabase e a Edge Function respondeu HTTP 200; naquele teste o envio foi ignorado porque ainda não havia token push de administrador.

## Android

O app móvel cria o canal padrão de notificações e exibe notificações também quando está em primeiro plano. O push remoto deve ser testado em aparelho físico com development build ou build de produção.
