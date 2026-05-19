# Alteração 0038 — Limpeza geral do projeto

**Data:** 2026-05-19
**Tipo:** chore

## O que será alterado

Remoção de código morto e atualização de documentação acumulados ao longo do crescimento orgânico do projeto. Nenhuma funcionalidade é afetada.

### Item 1 — Chaves de tradução órfãs (7 arquivos de locale)

As seguintes chaves existem nos 7 JSONs de locale mas nunca são referenciadas no código com `t('...')`:

| Chave | Motivo |
|-------|--------|
| `boosters.type` | UI que exibia "Tipo" foi removida |
| `common.add` | Botão "+" foi removido |
| `continents.ancient` | Tema visual de continentes removido |
| `continents.dawn` | idem |
| `continents.dusk` | idem |
| `continents.fire` | idem |
| `continents.grass` | idem |
| `continents.ice` | idem |
| `continents.lost_desert` | idem |
| `continents.underwater` | idem |
| `prestige.current` | Duplicata de `mines.col_prestige_current` |
| `prestige.max` | Duplicata de `mines.col_prestige_max` |
| `prestige.next` | Duplicata de `mines.col_next_prestige` |
| `prestige.order` | Duplicata de `mines.col_prestige_order` |

**Ação:** remover as 14 chaves de `pt.json`, `en.json`, `de.json`, `fr.json`, `es.json`, `it.json`, `nl.json`.

### Item 2 — Arquivo de planejamento na raiz

`traducoes.md` foi criado antes da implementação do i18n para planejar as chaves de tradução. O conteúdo real vive nos 7 JSONs. Pode ser removido.

**Ação:** `rm traducoes.md`

### Item 3 — CLAUDE.md desatualizado

O arquivo de instruções tem três inconsistências:

- Número do próximo documento: diz `0031`, correto é `0038`
- Componentes não listados: `DetalheIlhaPanel.tsx` e `LanguageSelector.tsx`
- Rotas não listadas: `GET /api/detalhe-valores` e `PUT /api/detalhe-valores/:mine_id/:col_key`

**Ação:** atualizar as três seções.

### Item 4 — Funções duplicadas entre componentes

As funções abaixo estão copy-pasted em 3 a 5 componentes:

| Função | Duplicada em | Destino |
|--------|-------------|---------|
| `roundByMagnitude` | SummaryPanel, IslandPanel, PromocaoPanel, ProducaoPanel, MinesTable | `utils/gameCalc.ts` |
| `computeProduction` | SummaryPanel, IslandPanel, PromocaoPanel | `utils/gameCalc.ts` |
| `minNextPrestige` | SummaryPanel, IslandPanel, PromocaoPanel | `utils/gameCalc.ts` |
| `formatTime` | SummaryPanel, IslandPanel, PromocaoPanel | `utils/gameCalc.ts` |
| `formatRaw` | ProducaoPanel, DetalheIlhaPanel | já existe em `utils/upgradeAdvisor.ts` |

**Ação:** criar `frontend/src/utils/gameCalc.ts`, mover as 4 primeiras funções para lá, e substituir as definições locais por imports. Para `formatRaw`: importar de `upgradeAdvisor.ts`.

## Motivação

O projeto cresceu com muitos commits de feature. A cada remoção de funcionalidade, chaves de locale e helpers duplicados ficaram para trás sem que houvesse um momento formal de limpeza. Esta alteração é esse momento.

## Arquivos modificados

**Item 1:**
- `frontend/src/locales/pt.json`
- `frontend/src/locales/en.json`
- `frontend/src/locales/de.json`
- `frontend/src/locales/fr.json`
- `frontend/src/locales/es.json`
- `frontend/src/locales/it.json`
- `frontend/src/locales/nl.json`

**Item 2:**
- `traducoes.md` (removido)

**Item 3:**
- `CLAUDE.md`

**Item 4:**
- `frontend/src/utils/gameCalc.ts` (novo)
- `frontend/src/components/SummaryPanel.tsx`
- `frontend/src/components/IslandPanel.tsx`
- `frontend/src/components/PromocaoPanel.tsx`
- `frontend/src/components/ProducaoPanel.tsx`
- `frontend/src/components/MinesTable.tsx`
- `frontend/src/components/DetalheIlhaPanel.tsx`

## O que NÃO foi tocado

- Todas as 17 migrações SQL — cadeia limpa, sem referências mortas
- Todos os 6 arquivos de rota do backend — todos registrados e em uso
- Todos os 12 componentes React — todos importados no Dashboard
- `types/index.ts`, `api/client.ts`, `utils/upgradeAdvisor.ts` — sem código morto
