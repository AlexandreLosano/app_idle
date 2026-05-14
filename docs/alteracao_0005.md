# Alteração 0005 — Minas em formato tabela

**Data:** 2026-05-13
**Tipo:** feat

## O que foi alterado

Substituído layout de cards por tabela para exibição e edição de minas.
Todas as células são inputs diretos; cada linha tem seu próprio botão "Salvar"
que persiste apenas aquela mina via PUT `/api/mines/:nome`.

## Arquivos modificados

- `frontend/src/components/MinesTable.tsx` — novo componente tabela
- `frontend/src/components/IslandPanel.tsx` — usa MinesTable ao expandir ilha
- `frontend/src/components/Dashboard.tsx` — Tab Minas usa MinesTable
- `frontend/src/components/MineCard.tsx` — removido
- `frontend/src/index.css` — estilos da tabela
