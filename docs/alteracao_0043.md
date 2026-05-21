# Alteração 0043 — Renomeação Island → Continent e Continent → Game Mode

**Data:** 2026-05-21
**Tipo:** refactor

## O que foi alterado

Renomeação completa de terminologia para alinhar o código com a nomenclatura oficial do jogo:
- O que o jogo chama de "Continente" era `Island` no código → passou a ser `Continent`
- O que o jogo chama de "Modo de Jogo" era `Continent` no código → passou a ser `GameMode`

## Motivação

Descoberto que "Ilha" no código corresponde a "Continente" no jogo oficial, e "Continente" corresponde a "Modo de Jogo". A nomenclatura errada tornava o código confuso e difícil de manter.

## Arquivos modificados

### Banco de Dados
- `backend/src/migrations/016_rename_continents_to_game_modes.sql` (novo)
- `backend/src/migrations/017_rename_islands_to_continents.sql` (novo)

### Backend
- `backend/src/routes/game_modes.ts` (novo — era continents.ts)
- `backend/src/routes/continents.ts` (reescrito — era islands.ts)
- `backend/src/routes/islands.ts` (removido)
- `backend/src/routes/mines.ts` (atualizado)
- `backend/src/index.ts` (atualizado)

### Frontend
- `frontend/src/types/index.ts`
- `frontend/src/api/client.ts`
- `frontend/src/components/ContinentPanel.tsx` (renomeado de IslandPanel.tsx)
- `frontend/src/components/DetalheContinentePanel.tsx` (renomeado de DetalheIlhaPanel.tsx)
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/components/SummaryPanel.tsx`
- `frontend/src/components/CadastrosPanel.tsx`
- `frontend/src/components/PromocaoPanel.tsx`
- `frontend/src/components/ProducaoPanel.tsx`
- `frontend/src/components/MinesTable.tsx`
- `frontend/src/locales/pt.json`
- `frontend/src/locales/en.json`
- `frontend/src/locales/es.json`
- `frontend/src/locales/de.json`
- `frontend/src/locales/fr.json`
- `frontend/src/locales/it.json`
- `frontend/src/locales/nl.json`
