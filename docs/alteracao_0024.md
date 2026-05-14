# Alteração 0024 — Remoção de atributos sem uso
**Data:** 2026-05-14
**Tipo:** refactor

## O que foi alterado
- Dropadas colunas `valor` e `dgts` da tabela `factors`
- Dropada coluna `ordem` da tabela `islands`
- Removido arquivo morto `backend/src/routes/prestige.ts` (tabela `prestige` já havia sido dropada na migração 003 e a rota nunca foi registrada no `index.ts`)
- Atualizado `ORDER BY` em `islands.ts` e `mines.ts`: `ordem NULLS LAST, id` → `id`
- Atualizado `types/index.ts`: removidos `valor` e `dgts` de `Factor`; removido `ordem` de `Island`

## Motivação
- `factors.valor`: texto como `'1e18'` nunca lido; toda matemática usa `Math.pow(1000, cont-1)`
- `factors.dgts`: declarado no tipo TypeScript mas nunca acessado em nenhum componente ou cálculo
- `islands.ordem`: nunca exibida, sem endpoint de edição; ilhas são inseridas com IDs sequenciais, tornando `ORDER BY id` equivalente
- `prestige.ts`: arquivo de rota referenciando tabela já inexistente, sem registro no servidor

## Arquivos modificados
- `backend/src/migrations/013_drop_unused_columns.sql` (novo)
- `backend/src/routes/islands.ts`
- `backend/src/routes/mines.ts`
- `backend/src/routes/prestige.ts` (deletado)
- `frontend/src/types/index.ts`
