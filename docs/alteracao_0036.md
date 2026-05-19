# Alteração 0036 — Detalhe Ilha: A e E como inputs; layout sem scroll

**Data:** 2026-05-19
**Tipo:** fix

## O que foi alterado

- Armazém (A) e Elevador (E) passaram a ser campos de input livres, igual às colunas 25–35. Nenhuma coluna lê mais dados do banco — todas as 13 colunas NÍVEIS são para digitação manual.
- Removida a função `fmtLevel` (não usada).
- `NIVEIS_COLS` unificada em um único array: `[{key:'A', label:'Armazém'}, {key:'E', label:'Elevador'}, {key:'25', label:'25'}, …]`.
- CSS ajustado para `table-layout: fixed` com padding e fontes compactos (9–11px) para caber na largura do painel sem barra de rolagem horizontal.
- `.detalhe-result-wrap` volta a `overflow: hidden` (sem `overflow-x: auto`).

## Arquivos modificados

- `frontend/src/components/DetalheIlhaPanel.tsx`
- `frontend/src/index.css`
