# Notificações operacionais do Clube WPI3D

Este fluxo envia push notifications para os dispositivos dos usuários que possuem `profiles.role = 'admin'`.

## Eventos

- Inserção em `profiles`: "Novo cliente cadastrado".
- Inserção em `quotes`: "Novo pedido #ID".

As notificações de alteração de status dos pedidos continuam sendo tratadas pela função `notify-status-change`.

## Configuração no Supabase

1. Faça deploy da Edge Function `notify-business-event` a partir de `supabase/functions/notify-business-event/index.ts`.
2. Confirme que `SUPABASE_SERVICE_ROLE_KEY` está configurada como secret da função.
3. Em Database > Webhooks, crie dois webhooks HTTP POST:
   - `profiles` + evento `INSERT` → URL da função `notify-business-event`.
   - `quotes` + evento `INSERT` → URL da função `notify-business-event`.
4. Em cada webhook, envie `Content-Type: application/json` e o cabeçalho de autorização com a chave de serviço usada pela função.
5. Confirme que pelo menos uma conta administrativa foi promovida em `profiles.role = 'admin'`.
6. Faça login dessa conta no aplicativo móvel ao menos uma vez para registrar o token em `push_tokens`.

Database Webhooks são assíncronos e são executados após a alteração da linha. O Supabase usa `pg_net` por baixo dessa funcionalidade.

## Teste ponta a ponta

1. No celular do administrador, mantenha notificações permitidas.
2. Crie uma nova conta de cliente.
3. Verifique a notificação "Novo cliente cadastrado".
4. Com um cliente autenticado, envie um novo pedido.
5. Verifique a notificação "Novo pedido #ID".

Para Android, o app móvel precisa de um development build ou build de produção para push remoto; Expo Go não cobre esse fluxo no Android a partir do SDK 53.
