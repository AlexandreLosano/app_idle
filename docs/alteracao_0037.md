# Alteração 0037 — Detalhe Ilha: análise por coluna com referência #3 e persistência

**Data:** 2026-05-19
**Tipo:** feat

## O que foi alterado

### Análise coluna a coluna com referência no #3 de prestígio
- A mina de rank #3 (3ª menor ordem de prestígio na ilha) serve como benchmark por coluna.
- Para cada célula de input: se o valor digitado >= valor do #3 → borda e texto **verde**; se < → **amarelo**.
- Células vazias ou sem valor no #3 não recebem cor.

### Persistência no banco
- Nova tabela `detalhe_valores (mine_id, col_key, valor)` com PK composta.
- Valores são salvos automaticamente ao sair do campo (`onBlur`).
- Ao selecionar uma ilha, todos os valores salvos das minas da ilha são carregados.

## Novos arquivos

- `backend/src/migrations/017_detalhe_valores.sql`
- `backend/src/routes/detalheValores.ts`

## Arquivos modificados

- `backend/src/index.ts` — registra `/api/detalhe-valores`
- `frontend/src/api/client.ts` — adiciona `api.detalheValores.{ list, save }`
- `frontend/src/components/DetalheIlhaPanel.tsx` — useEffect de load, handleBlur de save, getCellColor
- `frontend/src/index.css` — `.detalhe-col-input.cell-green` e `.cell-yellow`
