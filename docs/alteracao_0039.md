# Alteração 0039 — Execução da limpeza geral (plano definido em alteracao_0038)

**Data:** 2026-05-19
**Tipo:** chore

---

## Motivação

O projeto cresceu com muitos commits de feature. A cada remoção de funcionalidade, chaves de locale e helpers duplicados ficaram para trás sem um momento formal de limpeza. Esta alteração executa o plano documentado em `alteracao_0038.md`, que identificou 4 categorias de débito técnico. Nenhuma funcionalidade é alterada.

---

## Item 1 — Remoção de 14 chaves de tradução órfãs

### Chaves removidas

| Chave | Razão do abandono |
|-------|------------------|
| `common.add` | Botão "+" de adição rápida foi removido de todas as telas |
| `boosters.type` | Campo "Tipo" visível na UI de artefatos foi removido |
| `prestige.current` | Duplicata de `mines.col_prestige_current` (ambas usavam a mesma string) |
| `prestige.max` | Duplicata de `mines.col_prestige_max` |
| `prestige.next` | Duplicata de `mines.col_next_prestige` |
| `prestige.order` | Duplicata de `mines.col_prestige_order` |
| `continents.grass` | Tema visual de continentes removido — string nunca chamada com `t('continents.*')` |
| `continents.ice` | idem |
| `continents.fire` | idem |
| `continents.dawn` | idem |
| `continents.dusk` | idem |
| `continents.ancient` | idem |
| `continents.lost_desert` | idem |
| `continents.underwater` | idem |

### Chaves mantidas no bloco `prestige`

Somente `prestige.target_label` permanece — é a única usada em produção, no slider do ArtefatosPanel.

### Arquivos editados

- `frontend/src/locales/pt.json`
- `frontend/src/locales/en.json`
- `frontend/src/locales/de.json`
- `frontend/src/locales/fr.json`
- `frontend/src/locales/es.json`
- `frontend/src/locales/it.json`
- `frontend/src/locales/nl.json`

### Verificação

Grep de `t('boosters.type')`, `t('common.add')`, `t('continents.`)`, `t('prestige.current')` etc. em todo o diretório `frontend/src/` retornou zero resultados antes da remoção.

---

## Item 2 — Remoção de `traducoes.md`

`traducoes.md` foi criado na raiz do projeto antes da implementação do i18n, como rascunho de quais chaves seriam criadas. Após a implementação completa dos 7 arquivos de locale, o arquivo perdeu utilidade — todo o conteúdo real vive nos JSONs de locale.

**Ação:** `rm traducoes.md`

---

## Item 3 — Atualização do CLAUDE.md

Três inconsistências foram corrigidas:

### 3.1 — Número do próximo documento

```
Antes:  Próximo número: 0031
Depois: Próximo número: 0039
```

O número 0031 estava desatualizado desde as alterações 0031–0038.

### 3.2 — Componentes não listados na tabela

Dois componentes implementados não apareciam na tabela de componentes:

| Componente | Responsabilidade |
|-----------|-----------------|
| `DetalheIlhaPanel.tsx` | Tabela detalhada de uma ilha: grid de níveis por coluna (Armazém, Elevador, 25–35), colorização por rank de prestígio (#3 como referência), produção atual e ordem de prestígio por mina |
| `LanguageSelector.tsx` | Seletor de idioma com bandeiras emoji no header do Dashboard; persiste escolha em localStorage |

### 3.3 — Rotas não listadas na tabela de backend

Duas rotas implementadas (usadas por `DetalheIlhaPanel`) não estavam documentadas:

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/detalhe-valores` | Lista valores de detalhe por mina (`mine_id`, `col_key`, `valor`) |
| PUT | `/api/detalhe-valores/:mine_id/:col_key` | Salva valor de detalhe de uma mina |

### 3.4 — Util não listado

O arquivo `gameCalc.ts` (criado nesta mesma alteração, Item 4) foi adicionado à tabela de utils do CLAUDE.md.

---

## Item 4 — Centralização de funções duplicadas

### Problema

As funções abaixo existiam copy-pasted em múltiplos componentes, sem nenhuma diferença funcional entre as cópias:

| Função | Presença antes desta alteração |
|--------|-------------------------------|
| `roundByMagnitude(n)` | SummaryPanel, IslandPanel, PromocaoPanel, ProducaoPanel, MinesTable (5 cópias) |
| `computeProduction(mines, factors, boosterFactor)` | SummaryPanel, IslandPanel, PromocaoPanel (3 cópias — retorno divergia: string vs `{display,raw}`) |
| `minNextPrestige(mines, factors)` | SummaryPanel, IslandPanel, PromocaoPanel (3 cópias — shape do retorno divergia) |
| `formatTime(seconds)` | SummaryPanel, PromocaoPanel (2 cópias idênticas) |
| `formatRaw(raw, factors)` | ProducaoPanel, DetalheIlhaPanel (2 cópias — já existia exportada em `upgradeAdvisor.ts`) |

---

### Solução: novo arquivo `frontend/src/utils/gameCalc.ts`

Criado com as 4 funções unificadas e exportadas:

```typescript
// Arredonda respeitando a magnitude do número
export function roundByMagnitude(n: number): number

// Calcula a produção de uma lista de minas com booster aplicado
// Retorna sempre { display, raw } — "display" é a string formatada, "raw" é o valor absoluto
export function computeProduction(
  mines: Mine[], factors: Factor[], boosterFactor: number
): { display: string; raw: number }

// Encontra a mina com o menor próximo prestígio em um grupo de minas
// Retorna { display, raw, nome } — nunca null; se não há candidatos, raw=0 e display='—'
export function minNextPrestige(
  mines: Mine[], factors: Factor[]
): { display: string; raw: number; nome: string }

// Formata segundos em string legível (ex: "3d 5h", "45m 12s")
export function formatTime(seconds: number): string
```

---

### Decisões de unificação

#### `computeProduction` — unificação do tipo de retorno

A versão do SummaryPanel retornava `string`; as versões de IslandPanel e PromocaoPanel retornavam `{ display: string; raw: number }`. A versão unificada retorna sempre o objeto com ambos os campos.

**Adaptação necessária no SummaryPanel:**
- Antes: `const production = computeProduction(...)` → usado diretamente como string no JSX
- Depois: `const prodResult = computeProduction(...)` → JSX usa `prodResult.display`; `prodResult.raw` substitui o `prodRaw` que antes era calculado internamente em `minNextPrestige`

#### `minNextPrestige` — unificação do shape do retorno

| Versão | Retorno | Campo `nome` | Campo `valor`/`letra` separados |
|--------|---------|:---:|:---:|
| SummaryPanel | `NextPrestige \| null` (com `prodRaw` interno) | ✓ | ✓ |
| IslandPanel | `{ display, raw }` (`display` incluía o nome: `"500m (MineA)"`) | — | — |
| PromocaoPanel | `{ display, raw, nome }` | ✓ | — |
| **Unificada** | `{ display, raw, nome }` (sem null) | ✓ | — |

**Adaptações:**
- SummaryPanel: `next &&` → `next.raw > 0`; `{next.valor}{next.letra}` → `{next.display}`; `next.prodRaw` → `prodResult.raw`
- IslandPanel: a exibição anterior incluía o nome da mina no `display` (`"500m (MineA)"`); após a unificação, `display` é apenas o valor. O JSX foi ajustado para reconstruir: `{nextPrestige.display} ({nextPrestige.nome})`

#### `formatTime` — versão local no IslandPanel mantida

IslandPanel tem uma variante **diferente** de `formatTime` que recebe um segundo parâmetro com labels traduzidos (`TimeLabels: { year, month, day, hour }`), exibe anos/meses/dias/horas com os sufixos localizados e é usada para mostrar tempos maiores que um dia com granularidade mais legível. Essa variante é **local e não foi movida**, pois:
- Tem assinatura diferente: `formatTime(seconds, lbl)` vs `formatTime(seconds)`
- Comportamento diferente: exibe `"1A 3M 5D"` vs `"398d 5h"`
- Não está duplicada em nenhum outro componente

A função exportada de `gameCalc.ts` é usada por SummaryPanel e PromocaoPanel, onde o formato compacto em segundos/minutos/horas é suficiente.

#### `formatRaw` — já existia exportada em `upgradeAdvisor.ts`

`MinesTable` já importava `formatRaw` de `upgradeAdvisor.ts`. As cópias locais em `ProducaoPanel` e `DetalheIlhaPanel` foram removidas e substituídas pelo mesmo import.

---

### Mudanças por componente

#### `SummaryPanel.tsx`
- **Removidas:** `roundByMagnitude`, `computeProduction` (retornava string), `minNextPrestige` (retornava `NextPrestige | null` com `prodRaw` interno), `formatTime`
- **Adicionado import:** `import { computeProduction, minNextPrestige, formatTime } from '../utils/gameCalc'`
- **Lógica ajustada:**
  ```typescript
  // Antes
  const production = computeProduction(im, factors, bf);          // string
  const next = minNextPrestige(im, factors, bf);                   // NextPrestige | null
  const timeEst = next && next.prodRaw > 0 && next.raw > 0
    ? formatTime(next.raw / next.prodRaw) : '—';
  return { ..., production, next, ... };
  // JSX: {production} e {next.valor}{next.letra}

  // Depois
  const prodResult = computeProduction(im, factors, bf);          // { display, raw }
  const next = minNextPrestige(im, factors);                       // { display, raw, nome }
  const timeEst = prodResult.raw > 0 && next.raw > 0
    ? formatTime(next.raw / prodResult.raw) : '—';
  return { ..., production: prodResult.display, next, ... };
  // JSX: {production} e {next.display}
  ```
- **JSX ajustado:** `{next && (...)}` → `{next.raw > 0 && (...)}`

#### `IslandPanel.tsx`
- **Removidas:** `roundByMagnitude`, `computeProduction` (retornava `{ display, raw }`), `minNextPrestige` (retornava `{ display, raw }` com nome embutido no display)
- **Mantida local:** `formatTime(seconds, lbl: TimeLabels)` — versão localizada com anos/meses/dias
- **Adicionado import:** `import { computeProduction, minNextPrestige } from '../utils/gameCalc'`
- **JSX ajustado:** O display do próximo prestígio antes incluía o nome da mina na string (`"500m (MineA)"`); agora é reconstruído: `{nextPrestige.display} ({nextPrestige.nome})`
- **Verificação:** `nextPrestige.display !== '—'` → `nextPrestige.raw > 0` (mais semântico)

#### `PromocaoPanel.tsx`
- **Removidas:** `roundByMagnitude`, `computeProduction`, `minNextPrestige`, `formatTime`
- **Adicionado import:** `import { computeProduction, minNextPrestige, formatTime } from '../utils/gameCalc'`
- **Sem mudança de lógica:** o componente já usava `.display` e `.raw`, e já verificava `nextPrestige.raw > 0`
- **Mantida local:** `computeAccumulated` (lógica de acumulação segmentada, específica da simulação)

#### `ProducaoPanel.tsx`
- **Removidas:** `roundByMagnitude` (só era usada dentro de `formatRaw`), `formatRaw` (cópia da exportada em upgradeAdvisor)
- **Adicionado import:** `import { formatRaw } from '../utils/upgradeAdvisor'`
- **Mantidas locais:**
  - `computeProductionRaw` — retorna apenas o valor numérico raw; assinatura e semântica diferentes de `computeProduction`
  - `minNextPrestigeRaw` — retorna o menor valor de próximo prestígio em unidade bruta (number); não estava duplicada

#### `MinesTable.tsx`
- **Removida:** `roundByMagnitude` (usada pela função local `boostedDisplay`)
- **Adicionado import:** `import { roundByMagnitude } from '../utils/gameCalc'`
- **Sem mudança de lógica:** `boostedDisplay` continua local; só o helper de arredondamento foi extraído

#### `DetalheIlhaPanel.tsx`
- **Removida:** `formatRaw` (cópia com lógica de arredondamento inline — funcionalmente idêntica à exportada em upgradeAdvisor)
- **Adicionado import:** `import { formatRaw } from '../utils/upgradeAdvisor'`
- **Mantidas locais:** `scorePrestige`, `mineBottleneckRaw`, `getCellColor` — específicas deste componente

---

## Resultado

| Métrica | Antes | Depois |
|---------|------:|------:|
| Cópias de `roundByMagnitude` | 5 | 1 (gameCalc.ts) |
| Cópias de `computeProduction` | 3 | 1 (gameCalc.ts) |
| Cópias de `minNextPrestige` | 3 | 1 (gameCalc.ts) |
| Cópias de `formatTime` simples | 2 | 1 (gameCalc.ts) |
| Cópias de `formatRaw` | 3 (adv+prod+detalhe) | 1 (upgradeAdvisor.ts) |
| Chaves de locale totais | 98 | 84 |
| Arquivos de planejamento obsoletos | 1 | 0 |

TypeScript compilou sem erros após todas as alterações (`tsc --noEmit`).
