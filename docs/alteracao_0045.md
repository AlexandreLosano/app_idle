# Alteração 0045 — Tela Metas e remoção do target_pct

**Data:** 2026-05-22
**Tipo:** feat + refactor

## O que foi alterado

### Backend
- Migração 018: nova tabela `metas` (continent_id PK FK→continents, valor NUMERIC, letra VARCHAR(5), updated_at)
- Nova rota `/api/metas` (GET: lista todas; PUT /:continent_id: upsert por continente)
- `artefatos.ts`: removido `target_pct` de CONFIG_TIPOS e de todas as queries (o campo permanece na tabela para dados históricos)

### Frontend
- Nova aba **Metas** no Dashboard (entre Continentes e Detalhe Continente)
  - Tabela por continente: produção/s atual, tempo até próximo prestígio, meta
  - Continentes com tempo ≤ 30 dias: meta automática = valor do próximo prestígio mais baixo (badge "Auto", read-only)
  - Continentes com tempo > 30 dias: meta editável (campo valor + seletor de letra) com botão Salvar
  - Calculadora de produção: entrar quantidade desejada + tempo → exibe produção/s necessária (cálculo reativo, sem botão)
- Removido slider "% do Target" da aba Boosters/Artefatos
- `upgradeAdvisor.ts`: `computeUpgradeHints` agora recebe `metaRaw` (valor bruto da meta do continente) ao invés de `targetPct`; `baseRaw = metaRaw / 86400`
- `ContinentPanel.tsx`: calcula `metaRaw` dinamicamente — se tempo ≤ 30d usa `nextPrestige.raw`, senão usa meta salva no banco
- `MinesTable.tsx`: removida prop `targetPct`; coluna Target exibe `targetRaw` diretamente sem multiplicação
- `client.ts`: novo namespace `api.metas`; removido `target_pct` dos tipos de `getConfig`/`updateConfig`

### i18n
- Adicionada chave `dashboard.tabs.metas` em todos os 7 idiomas (pt/en/de/es/fr/it/nl)
- Adicionado bloco `metas.*` com 14 chaves em todos os 7 idiomas

## Motivação
Substituir o controle global e grosseiro de "% do Target" por metas concretas configuráveis por continente, permitindo orientar as setas de upgrade (↑/✓/→) com base em objetivos reais do jogador. Adicionada calculadora de produção para facilitar o planejamento.

## Arquivos criados
- `backend/src/migrations/018_metas.sql`
- `backend/src/routes/metas.ts`
- `frontend/src/components/MetasPanel.tsx`
- `docs/alteracao_0045.md`

## Arquivos modificados
- `backend/src/index.ts`
- `backend/src/routes/artefatos.ts`
- `frontend/src/api/client.ts`
- `frontend/src/types/index.ts`
- `frontend/src/utils/upgradeAdvisor.ts`
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/components/ContinentPanel.tsx`
- `frontend/src/components/MinesTable.tsx`
- `frontend/src/index.css`
- `frontend/src/locales/pt.json` (e en, de, es, fr, it, nl)
