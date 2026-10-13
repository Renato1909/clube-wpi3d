# Correções de integração e segurança do aplicativo

## Aplicação no Supabase existente

O patch não remove dados de clientes. Depois de confirmar que o projeto está ativo:

1. Executar `supabase/quote-update-security.sql` no SQL Editor. Esse arquivo instala a proteção de UPDATE e restringe privilégios de coluna sem recriar as tabelas.
2. Conferir a política `quotes_update_own_or_admin` e as demais políticas efetivas. O cliente só deve acessar seus registros.
3. Publicar `notify-business-event` incluindo `index.ts` e `payload.ts`. O gateway usa `verify_jwt = false`, pois o handler exige o segredo interno `x-clube-wpi3d-webhook-secret` e o compara com `business_webhook_secrets`.
4. Manter o segredo no banco e `service_role` somente no servidor. O app não recebe nenhuma dessas credenciais.
5. Confirmar os triggers de INSERT concluído e da primeira transição de `submission_complete` para true.

Para instalação nova, executar `schema.sql` e depois `admin-access.sql`. A mesma proteção está incluída no script administrativo para evitar reabrir a falha ao reaplicá-lo.

## Verificação

Os testes executam os SQLs reais em PostgreSQL isolado (PGlite), com schemas mínimos que representam Auth/Storage, e verificam:

- cliente lê somente seus orçamentos;
- cliente conclui o envio, mas não reabre nem muda status;
- privilégios antigos de UPDATE amplo são removidos;
- cliente não altera o papel do perfil;
- administrador mantém acesso ao status de pedidos de clientes;
- webhook aceita INSERT concluído e UPDATE de conclusão;
- webhook rejeita eventos incompletos, repetidos e segredos incorretos.

Com Node 24:

```sh
cd supabase/tests
npm ci
npm test
```

Essa verificação não substitui o teste no projeto Supabase real, nem comprova entrega de push por FCM/APNs. Não dispara notificações reais e não usa dados de clientes.

## Ainda necessário para lançamento

- Projeto Supabase ativo, auditoria dos grants/policies efetivos e teste de integração.
- Cadastro de aparelhos, FCM/APNs, vínculo EAS e testes com conta cliente e administrador.
- Catálogo com fotos públicas válidas: HTTPS absoluto, caminho do bucket `product-images` ou caminho legado do site com sua URL pública configurada no app.
- Exclusão de conta, política de privacidade, recurso web de exclusão e materiais das lojas.
