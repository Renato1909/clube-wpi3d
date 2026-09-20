# Plano de agentes de IA — Clube WPI3D

## Princípios

- Todo agente roda **no servidor** (Supabase Edge Functions); o app e o site nunca falam direto com o provedor de LLM nem guardam chaves secretas.
- Cada agente tem escopo fechado, instruções versionadas no repositório (`supabase/functions/` + `docs/`) e log auditável.
- Sempre existe caminho para atendimento humano (WhatsApp/e-mail) e o cliente é avisado de que fala com um assistente.

## Agentes previstos

### 1. Assistente do Clube (atendimento no app) — Fase 2
- **Função:** responder dúvidas frequentes (materiais, prazos, cuidados com a peça, status do orçamento).
- **Contexto:** catálogo (`products`), status dos orçamentos do próprio usuário (via RLS do usuário autenticado), FAQ versionado no repo.
- **Limites:** não promete prazo/preço que não esteja na base; não altera dados; transfere para humano quando detectado.

### 2. Assistente de Orçamento (cotutor da peça) — Fase 2
- **Função:** guiar o cliente na descrição da peça (uso, dimensões, ambiente interno/externo) e sugerir material (PLA, PETG, ABS) com justificativa; estimativa preliminar de volume/impressão a partir de STL.
- **Entrada:** respostas do formulário `/orcamento` e metadados dos anexos (nunca abre arquivos do cliente sem registro).
- **Saída:** rascunho anexado ao `quote` como campo `notes` interno ou tabela `quote_drafts`; nada é enviado ao cliente automaticamente.

### 3. Agente de Operações (interno, painel admin) — Fase 2/3
- **Função:** triar orçamentos novos (resumo, categoria, prioridade sugerida), rascunhar resposta de status e resumo diário para o administrador.
- **Acesso:** usa `service_role` apenas dentro da Edge Function; escreve sugestões, nunca muda `status` sozinho.

### 4. Agente de Conteúdo (catálogo) — Fase 3
- **Função:** gerar descrições, categorias e legendas a partir das fotos/nomes informados pelo proprietário; rascunho para revisão humana antes de publicar na tabela `products`.

### 5. Moderação de uploads — Fase 3 (opcional)
- **Função:** checagem leve dos anexos (tamanho, tipo real via MIME, sinalização de conteúdo inadequado) antes de entrarem na análise.

## Infraestrutura comum

- `supabase/functions/agents/*` — uma função por agente, chamada com a sessão do usuário (JWT); contexto injetado no servidor.
- Tabela `agent_logs` (agent, user_id, input_resumo, output_resumo, tokens, criado_em) com leitura admin — auditoria e custo.
- Rate limit por usuário e por dia; resposta com timeout e fallback humano.
- Provedor de LLM configurado por variável de ambiente da Edge Function (não versionada).

## Ordem de implementação

1. **Pré-requisito:** orçamento real integrado (tabelas + storage já criados no schema).
2. **Fase 2a:** Assistente do Clube (FAQ + status) dentro do app — maior impacto, menor risco.
3. **Fase 2b:** Assistente de Orçamento ajudando a preencher o formulário.
4. **Fase 2c:** Agente de Operações no `/admin`.
5. **Fase 3:** Conteúdo e moderação.

## Verificar por agente

- Teste com perguntas fora do escopo (deve recusar e oferecer humano).
- Confirmar que o log grava agente, usuário e resumo sem gravar dados sensíveis além do necessário.
- Confirmar que nenhuma chave secreta aparece no bundle do app ou do site.
