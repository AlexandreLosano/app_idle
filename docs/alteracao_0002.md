# Alteração 0002 — FK minas → ilhas e reestruturação de tabs

**Data:** 2026-05-13
**Tipo:** feat

## O que foi alterado

- Adicionado `island_id` (FK) na tabela `mines` referenciando `islands`
- Banco reseedado com 8 ilhas e 39 minas mapeadas por ilha (baseado na planilha Transformação-Normal)
- Frontend reestruturado para 2 tabs: **Ilhas** e **Minas**
- Tab Ilhas: lista expandível de ilhas; ao expandir mostra as minas da ilha inline
- Tab Minas: grid de todas as minas com filtro por ilha e seletor de ilha no form de edição

## Motivação

Banco estava vazio (migration anterior não populou). Reestruturação para refletir
a relação real do jogo: cada mina pertence a uma ilha.

## Arquivos modificados

- `backend/src/migrations/002_island_fk_and_reseed.sql` — nova migração
- `backend/src/routes/mines.ts` — GET aceita `?island_id=`, retorna `island_nome` via JOIN
- `frontend/src/types/index.ts` — `Mine` ganhou `island_id` e `island_nome`
- `frontend/src/components/Dashboard.tsx` — 2 tabs: Ilhas / Minas
- `frontend/src/components/IslandPanel.tsx` — lista expansível com minas embutidas
- `frontend/src/components/MineCard.tsx` — seletor de ilha no form, tag de ilha no card
- `frontend/src/index.css` — estilos para novos layouts

## Schema alterado

```sql
ALTER TABLE mines ADD COLUMN island_id INTEGER REFERENCES islands(id);
```
