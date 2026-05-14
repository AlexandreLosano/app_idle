# Alteração 0014 — Nome da mina no header de próximo prestígio

**Data:** 2026-05-13
**Tipo:** feat

## O que foi alterado

A função `minNextPrestige` em `IslandPanel.tsx` passou a incluir `m.nome` no resultado. O display agora exibe `{valor}{letra} ({nome})` — ex: `15.1ay (Realgar)` — tornando claro qual mina está mais próxima do prestígio sem precisar expandir a ilha.

## Arquivos modificados

- `frontend/src/components/IslandPanel.tsx`
