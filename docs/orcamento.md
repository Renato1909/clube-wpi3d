# Orçamento — estado atual

A página `/orcamento` envia solicitações reais no visual do Clube WPI3D.

Inclui contato, endereço opcional, descrição, quantidade, material, cor, data desejada e observações. A seleção local aceita até 5 arquivos de 20 MB cada, nos formatos JPG, JPEG, PNG, WEBP, PDF, MP4, MOV, STL, 3MF e OBJ. É possível remover anexos individualmente; arquivos duplicados não são adicionados novamente.

O botão “Enviar orçamento” valida os campos e grava a solicitação na tabela `quotes` com status `recebido`; os anexos sobem para o bucket privado `quote-files` no caminho `{user_id}/{quote_id}/` e são registrados em `quote_files`. Se o envio dos anexos falhar, a solicitação permanece registrada e o cliente é orientado a responder ao contato da equipe com os arquivos. Sem sessão válida, o formulário encaminha para `/login?next=/orcamento`.

O cliente acompanha o andamento em `/minha-conta`; o administrador consulta e atualiza o status em `/admin` (papel `admin` em `profiles`, definido por `supabase/admin-access.sql`).

## Verificar

Execute `npm run lint` e `npm run build`. Com `npm run dev`, abra `/orcamento`, confira o bloqueio de campos vazios e envie com dados válidos. Selecione e remova arquivos e tente um formato não aceito. Confirme em `/minha-conta` que a solicitação aparece com status Recebido e, com uma conta administradora, altere o status em `/admin`. Verifique também em uma tela estreita.

Os testes reais dependem do projeto Supabase configurado com o schema (`supabase/schema.sql` e `supabase/admin-access.sql` aplicados) e do bucket `quote-files` disponível.

## Próxima etapa

Validar o conteúdo dos arquivos também no servidor (Edge Function), além do limite do bucket e da extensão verificada no navegador. Adicionar notificação ao administrador e ao cliente nas mudanças de status. As credenciais devem permanecer em variáveis de ambiente ignoradas pelo Git.
