# Alteração 0003 — Simplificação do schema

**Data:** 2026-05-13
**Tipo:** refactor

## O que foi alterado

Simplificação do banco de dados conforme solicitado:
- `game_state` removida
- `prestige` removida (prestígio movido para campos em `mines`)
- `mines`: removidos `ordem` e `verificacao`; adicionados `prestigio_atual` e `prestigio_maximo`
- `islands`: removidas colunas de progresso (`proximo_gem`, `valor`, `valor_letra`, `falta_horas`, `falta_letras`) — table fica como lookup simples

## Arquivos modificados

- `backend/src/migrations/003_simplify_schema.sql` — nova migração
- `backend/src/routes/mines.ts` — campos de prestígio no UPDATE, sem verificacao/ordem
- `backend/src/routes/islands.ts` — simplificado, só GET
- `backend/src/routes/gameState.ts` — mantido apenas `/factors`
- `backend/src/index.ts` — removida rota `/api/prestige`
- `frontend/src/types/index.ts` — Mine com prestigio_atual/maximo; Island simplificada; removido GameState/Prestige
- `frontend/src/api/client.ts` — removidas chamadas de game/prestige
- `frontend/src/components/Dashboard.tsx` — header simplificado, sem game state
- `frontend/src/components/MineCard.tsx` — exibe e edita prestígio atual/máximo
- `frontend/src/components/IslandPanel.tsx` — simplificado, sem edição de ilha
- `frontend/src/components/PrestigePanel.tsx` — removido
- `frontend/src/index.css` — CSS reescrito sem estilos de prestige/game-state
