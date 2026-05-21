# Guia de Renomeação: Island → Continent e Continent → Game Mode

**Objetivo:** Alinhar o código com a nomenclatura oficial do jogo.
- O que o jogo chama de **Continente** → era `Island` no código → passa a ser `Continent`
- O que o jogo chama de **Modo de Jogo** → era `Continent` no código → passa a ser `GameMode`

**Data de criação:** 2026-05-21  
**Próxima alteração doc:** `alteracao_0043.md`

---

## ⚠️ Regras Obrigatórias Antes de Cada Sessão

1. **Analise os tokens antes de iniciar cada fase.** Se o contexto da conversa já estiver longo (muitos arquivos lidos/editados), inicie uma nova sessão.
2. **Marque cada checkbox imediatamente após concluir o passo** — NÃO ACUMULE.
3. **Nunca pule fases** — cada fase depende da anterior.
4. **Após cada fase completa, faça o rebuild** antes de continuar.
5. **Nunca faça merge para `main`** sem aprovação explícita do usuário.

---

## Mapa de Renomeações

| Contexto | Antes | Depois |
|---|---|---|
| Tabela SQL | `continents` | `game_modes` |
| Tabela SQL | `islands` | `continents` |
| Coluna FK (em islands/continents) | `continent_id` | `game_mode_id` |
| Coluna FK (em mines) | `island_id` | `continent_id` |
| Alias JOIN em mines | `island_nome` | `continent_nome` |
| Rota backend | `/api/continents` | `/api/game-modes` |
| Rota backend | `/api/islands` | `/api/continents` |
| Query param em islands | `?continent_id=` | `?game_mode_id=` |
| Query param em mines | `?island_id=` | `?continent_id=` |
| Query param em mines | `?continent_id=` | `?game_mode_id=` |
| Arquivo de rota | `routes/continents.ts` | `routes/game_modes.ts` |
| Arquivo de rota | `routes/islands.ts` | `routes/continents.ts` |
| Interface TypeScript | `Island` | `Continent` |
| Interface TypeScript | `Continent` | `GameMode` |
| Campo na interface Island | `continent_id` | `game_mode_id` |
| Campo na interface Mine | `island_id` | `continent_id` |
| Campo na interface Mine | `island_nome` | `continent_nome` |
| Componente React | `IslandPanel.tsx` | `ContinentPanel.tsx` |
| Componente React | `DetalheIlhaPanel.tsx` | `DetalheContinentePanel.tsx` |
| Chave i18n | `islands.*` | `continents.*` |
| Chave i18n | `dashboard.tabs.islands` | `dashboard.tabs.continents` |
| Chave i18n | `mines.col_island` | `mines.col_continent` |
| Chave i18n | `production.col_island` | `production.col_continent` |
| Chave i18n | `register.continents` | `register.game_modes` |
| Chave i18n | `register.islands` | `register.continents` |
| Chave i18n | `register.continent_name` | `register.game_mode_name` |
| Chave i18n | `register.island_name` | `register.continent_name` |
| Chave i18n | `register.select_continent` | `register.select_game_mode` |
| Chave i18n | `register.select_island` | `register.select_continent` |

---

## FASE 1 — Banco de Dados

> **Tokens:** Esta fase tem 2 arquivos novos pequenos. Pode iniciar mesmo com contexto longo.

### Passo 1.1 — Criar migração 016 (renomeia continents → game_modes)

- [x] Criar o arquivo `backend/src/migrations/016_rename_continents_to_game_modes.sql` com o conteúdo:

```sql
-- Renomeia tabela continents para game_modes
ALTER TABLE continents RENAME TO game_modes;

-- Renomeia a coluna continent_id em islands para game_mode_id
ALTER TABLE islands RENAME COLUMN continent_id TO game_mode_id;

-- Renomeia a constraint de FK se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'islands' AND constraint_name = 'islands_continent_id_fkey'
  ) THEN
    ALTER TABLE islands RENAME CONSTRAINT islands_continent_id_fkey TO islands_game_mode_id_fkey;
  END IF;
END$$;
```

### Passo 1.2 — Criar migração 017 (renomeia islands → continents)

- [x] Criar o arquivo `backend/src/migrations/017_rename_islands_to_continents.sql` com o conteúdo:

```sql
-- Renomeia tabela islands para continents
ALTER TABLE islands RENAME TO continents;

-- Renomeia a coluna island_id em mines para continent_id
ALTER TABLE mines RENAME COLUMN island_id TO continent_id;

-- Renomeia a constraint de FK se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'mines' AND constraint_name = 'mines_island_id_fkey'
  ) THEN
    ALTER TABLE mines RENAME CONSTRAINT mines_island_id_fkey TO mines_continent_id_fkey;
  END IF;
END$$;
```

### Passo 1.3 — Verificar que db.ts aplica as migrações em ordem

- [x] Abrir `backend/src/db.ts` e confirmar que `runMigrations()` aplica todos os arquivos `.sql` da pasta `migrations/` em ordem numérica. **Não alterar o arquivo** — apenas confirmar.

### Passo 1.4 — Rebuild somente o backend e verificar migrações

- [x] Executar:
```bash
sg docker -c "docker compose -p app_idle_dev up --build -d backend"
```
- [x] Aguardar o container ficar saudável
- [x] Verificar logs para confirmar que as migrações 016 e 017 foram aplicadas sem erro:
```bash
sg docker -c "docker compose -p app_idle_dev logs backend | grep -E '(016|017|Migration|migration|ERROR|error)'"
```
- [x] Verificar no banco que as tabelas foram renomeadas:
```bash
sg docker -c "docker compose -p app_idle_dev exec db psql -U idle_user -d idle_db -c '\dt'"
```
Deve mostrar `continents`, `game_modes`, `mines` — **não** deve aparecer `islands` nem a antiga `continents` de modo de jogo.

---

## FASE 2 — Backend: Rotas

> **⚠️ Análise de tokens:** Esta fase edita 4 arquivos. Se o contexto da sessão já estiver com mais de ~10 trocas de mensagens longas após a Fase 1, **inicie nova sessão** antes de continuar.

### Passo 2.1 — Criar `routes/game_modes.ts` (antigo continents.ts)

- [x] Criar o arquivo `backend/src/routes/game_modes.ts` com o conteúdo adaptado de `continents.ts`:
  - Todas as queries SQL: `continents` → `game_modes`
  - Nome do router exportado: `continentsRouter` → `gameModesRouter`
  - Conteúdo completo:

```typescript
import { Router } from 'express';
import { pool } from '../db';

export const gameModesRouter = Router();

gameModesRouter.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM game_modes ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

gameModesRouter.post('/', async (req, res) => {
  const { nome } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO game_modes (nome) VALUES ($1) RETURNING *',
      [nome]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

gameModesRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  try {
    const result = await pool.query(
      'UPDATE game_modes SET nome = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [nome, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
```

> **Nota:** Se o `continents.ts` original tiver lógica adicional, leia-o antes de criar o `game_modes.ts` para não perder nada.

### Passo 2.2 — Reescrever `routes/continents.ts` (antigo islands.ts)

- [x] **Antes de editar:** Ler o arquivo `backend/src/routes/islands.ts` para confirmar a lógica atual.
- [x] Sobrescrever `backend/src/routes/continents.ts` com o conteúdo adaptado de `islands.ts`:
  - Todas as queries SQL: `islands` → `continents`, `continent_id` → `game_mode_id`
  - Query param: `continent_id` → `game_mode_id`
  - Nome do router exportado: `islandsRouter` → `continentsRouter`
  - Exemplo do GET com filtro:

```typescript
continentsRouter.get('/', async (req, res) => {
  try {
    const { game_mode_id } = req.query;
    let query = 'SELECT * FROM continents ORDER BY id';
    const params: any[] = [];
    if (game_mode_id) {
      query = 'SELECT * FROM continents WHERE game_mode_id = $1 ORDER BY id';
      params.push(game_mode_id);
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
```

> **Nota:** Adaptar POST e PUT da mesma forma — `continent_id` → `game_mode_id`, tabela `islands` → `continents`.

### Passo 2.3 — Atualizar `routes/mines.ts`

- [x] **Antes de editar:** Ler `backend/src/routes/mines.ts` para mapear todos os usos.
- [x] Editar o arquivo fazendo as seguintes substituições:
  - Query param `island_id` → `continent_id`
  - Query param `continent_id` → `game_mode_id`
  - SQL JOIN: `LEFT JOIN islands i ON i.id = m.island_id` → `LEFT JOIN continents c ON c.id = m.continent_id`
  - Alias: `i.nome AS island_nome` → `c.nome AS continent_nome`
  - Filtro SQL: `i.continent_id` → `c.game_mode_id`
  - Variável local: `island_id` → `continent_id`, `continent_id` → `game_mode_id`

### Passo 2.4 — Atualizar `backend/src/index.ts`

- [x] **Antes de editar:** Ler `backend/src/index.ts`.
- [x] Editar o arquivo:
  - Import: `import { continentsRouter } from './routes/continents'` → `import { gameModesRouter } from './routes/game_modes'`
  - Import: `import { islandsRouter } from './routes/islands'` → `import { continentsRouter } from './routes/continents'`
  - Mount: `app.use('/api/continents', continentsRouter)` → `app.use('/api/game-modes', gameModesRouter)`
  - Mount: `app.use('/api/islands', islandsRouter)` → `app.use('/api/continents', continentsRouter)`

### Passo 2.5 — Remover arquivo antigo `routes/islands.ts`

- [x] Deletar `backend/src/routes/islands.ts` (foi substituído por `continents.ts`)

### Passo 2.6 — Rebuild e verificar rotas

- [x] Executar:
```bash
sg docker -c "docker compose -p app_idle_dev up --build -d backend"
```
- [x] Verificar logs sem erros de compilação:
```bash
sg docker -c "docker compose -p app_idle_dev logs backend | tail -30"
```
- [x] Testar as rotas novas (ajuste a porta conforme seu ambiente):
```bash
curl http://localhost:3000/api/game-modes
curl http://localhost:3000/api/continents
curl http://localhost:3000/api/mines
```
Cada um deve retornar JSON sem erro 500.

---

## FASE 3 — Frontend: Types e API Client

> **⚠️ Análise de tokens:** Esta fase edita 2 arquivos pequenos mas críticos (o erro aqui quebra tudo). Se a sessão já estiver longa, **inicie nova sessão** e informe ao Claude que está na Fase 3.

### Passo 3.1 — Atualizar `frontend/src/types/index.ts`

- [x] **Antes de editar:** Ler o arquivo completo.
- [x] Fazer as seguintes renomeações:
  - Interface `Continent` → `GameMode` (sem alterar os campos internos por enquanto)
  - Interface `Island` → `Continent`
  - Dentro da nova interface `Continent` (ex-Island): campo `continent_id` → `game_mode_id`
  - Interface `Mine`: campo `island_id` → `continent_id`
  - Interface `Mine`: campo `island_nome` → `continent_nome`

### Passo 3.2 — Atualizar `frontend/src/api/client.ts`

- [x] **Antes de editar:** Ler o arquivo completo.
- [x] Fazer as seguintes alterações:
  - Import do tipo `Continent` → `GameMode`, `Island` → `Continent`
  - Bloco `continents:` → `gameModes:` com URL `/game-modes`
  - Bloco `islands:` → `continents:` com URL `/continents`
  - Dentro do novo `continents` (ex-islands): param `continent_id` → `game_mode_id`
  - Dentro de `mines`: param `island_id` → `continent_id`, param `continent_id` → `game_mode_id`
  - Tipo retornado: `Island[]` → `Continent[]`, `Continent[]` → `GameMode[]`

---

## FASE 4 — Frontend: Componentes

> **⚠️ Análise de tokens:** Esta é a fase mais longa — 8 arquivos. **Fortemente recomendado iniciar nova sessão.** Informe ao Claude: "Estou na Fase 4 do guia de renomeação island→continent. Vou passar os passos um a um."

### Passo 4.1 — Renomear e atualizar `Dashboard.tsx`

- [x] **Antes de editar:** Ler `frontend/src/components/Dashboard.tsx`.
- [x] Editar no lugar (não renomear o arquivo):
  - Import: `IslandPanel` → `ContinentPanel` (do novo arquivo)
  - Import: `DetalheIlhaPanel` → `DetalheContinentePanel`
  - Import de tipos: `Island` → `Continent`, `Continent` → `GameMode`
  - Estado: `islands` → `continents`, `continents` → `gameModes`
  - Estado: `activeContinentId` → `activeGameModeId`
  - Chamada de API: `api.gameModes.list()`, `api.continents.list(activeGameModeId)`, `api.mines.list(undefined, activeGameModeId)`
  - Tipo da aba: `'islands'` → `'continents'` (no union type e no useState)
  - Classe CSS: `continent-select` → `game-mode-select`
  - Chave i18n: `dashboard.tabs.islands` → `dashboard.tabs.continents`
  - Props passadas aos componentes: atualizar `islands={continents}`, `continents={gameModes}`

### Passo 4.2 — Renomear `IslandPanel.tsx` → `ContinentPanel.tsx`

- [x] Criar `frontend/src/components/ContinentPanel.tsx` com o conteúdo de `IslandPanel.tsx` adaptado:
  - Nome do componente: `IslandPanel` → `ContinentPanel`
  - Interface de Props: `islands: Island[]` → `continents: Continent[]`
  - Import de tipo: `Island` → `Continent`
  - Todas as variáveis: `islands` → `continents`, `island` → `continent`
  - Filtro: `m.island_id === island.id` → `m.continent_id === continent.id`
  - Funções: `extracaoIslandStatus` → `extracaoContinentStatus`, `islandBalance` → `continentBalance`
  - Variáveis internas: `islandMines` → `continentMines`
  - Classes CSS: `.islands-table-header` → `.continents-table-header`, `.island-row` → `.continent-row`
  - Chaves i18n: `islands.*` → `continents.*`, `islands.col_island` → `continents.col_continent`
- [x] Deletar `frontend/src/components/IslandPanel.tsx`

### Passo 4.3 — Renomear `DetalheIlhaPanel.tsx` → `DetalheContinentePanel.tsx`

- [x] Criar `frontend/src/components/DetalheContinentePanel.tsx` com o conteúdo de `DetalheIlhaPanel.tsx` adaptado:
  - Nome do componente: `DetalheIlhaPanel` → `DetalheContinentePanel`
  - Interface de Props: `islands: Island[]` → `continents: Continent[]`
  - Import de tipo: `Island` → `Continent`
  - Estado: `selectedIslandId` → `selectedContinentId`
  - Filtro: `m.island_id === selectedContinentId` → `m.continent_id === selectedContinentId`
  - Texto do select: `"Selecionar ilha…"` → `"Selecionar continente…"`
  - Loop: `islands.map(i => ...)` → `continents.map(c => ...)`
- [x] Deletar `frontend/src/components/DetalheIlhaPanel.tsx`

### Passo 4.4 — Atualizar `SummaryPanel.tsx`

- [x] **Antes de editar:** Ler `frontend/src/components/SummaryPanel.tsx`.
- [x] Editar:
  - Import de tipo: `Island` → `Continent`
  - Props: `islands: Island[]` → `continents: Continent[]`
  - Variáveis: `islands.map(island => ...)` → `continents.map(continent => ...)`
  - Filtro: `m.island_id === island.id` → `m.continent_id === continent.id`
  - Chave i18n: `islands.mines_count` → `continents.mines_count`

### Passo 4.5 — Atualizar `CadastrosPanel.tsx`

- [x] **Antes de editar:** Ler `frontend/src/components/CadastrosPanel.tsx`.
- [x] Editar (este é o mais complexo da fase — ler com atenção antes):
  - Import de tipos: `Island` → `Continent`, `Continent` → `GameMode`
  - Props: `continents: Continent[]` → `gameModes: GameMode[]`
  - Estado `islands` → `continents`
  - Carregamento: `api.islands.list()` → `api.continents.list()`
  - Funções CRUD de continente → game mode:
    - `createContinent()` → `createGameMode()`, chama `api.gameModes.create()`
    - `saveContEdit()` → `saveGameModeEdit()`, chama `api.gameModes.update()`
  - Funções CRUD de island → continent:
    - `createIsland()` → `createContinent()`, chama `api.continents.create()` com `game_mode_id`
    - `saveIslandEdit()` → `saveContinentEdit()`, chama `api.continents.update()`
  - Funções CRUD de mine: `island_id` → `continent_id`
  - Filtros: `i.continent_id === Number(mContId)` → `i.game_mode_id === Number(mContId)`
  - Chaves i18n: `register.continents` → `register.game_modes`, `register.islands` → `register.continents`, etc.
  - Dropdowns: `gameModes.map(gm => ...)`, `continents.map(c => ...)`

### Passo 4.6 — Atualizar `PromocaoPanel.tsx`

- [x] **Antes de editar:** Ler `frontend/src/components/PromocaoPanel.tsx`.
- [x] Editar:
  - Import de tipo: `Island` → `Continent`
  - Props: `islands: Island[]` → `continents: Continent[]`
  - Loop: `islands.map(island => ...)` → `continents.map(continent => ...)`
  - Filtro: `m.island_id === island.id` → `m.continent_id === continent.id`
  - Classes CSS: `.promo-island-row` → `.promo-continent-row`, `.island-title` → `.continent-title`

### Passo 4.7 — Atualizar `ProducaoPanel.tsx`

- [x] **Antes de editar:** Ler `frontend/src/components/ProducaoPanel.tsx`.
- [x] Editar:
  - Import de tipo: `Island` → `Continent`
  - Props: `islands: Island[]` → `continents: Continent[]`
  - Loop: `islands.map(island => ...)` → `continents.map(continent => ...)`
  - Filtro: `m.island_id === island.id` → `m.continent_id === continent.id`
  - Chave i18n: `production.col_island` → `production.col_continent`

### Passo 4.8 — Atualizar `MinesTable.tsx`

- [x] **Antes de editar:** Ler `frontend/src/components/MinesTable.tsx`.
- [x] Editar:
  - Import de tipo: `Island` → `Continent` (se usado)
  - Variáveis: `islandRawTotals` → `continentRawTotals`, `islandGroups` → `continentGroups`
  - Campo: `m.island_id` → `m.continent_id`
  - Classe CSS: `.col-ilha` → `.col-continente`
  - Chave i18n: `mines.col_island` → `mines.col_continent`

### Passo 4.9 — Rebuild frontend e verificar compilação

- [x] Executar:
```bash
sg docker -c "docker compose -p app_idle_dev up --build -d frontend"
```
- [x] Verificar logs de build TypeScript sem erros:
```bash
sg docker -c "docker compose -p app_idle_dev logs frontend | tail -50"
```
- [ ] Acessar o app no browser e verificar que carrega sem erros no console.

---

## FASE 5 — Frontend: i18n (7 idiomas)

> **⚠️ Análise de tokens:** São 7 arquivos JSON. Se a sessão já estiver longa, **inicie nova sessão**. Informe ao Claude: "Estou na Fase 5 do guia, preciso atualizar os 7 arquivos de locale."

### Para cada idioma abaixo, fazer as mesmas alterações de chaves e valores:

**Idiomas:** `pt.json`, `en.json`, `es.json`, `de.json`, `fr.json`, `it.json`, `nl.json`  
**Caminho:** `frontend/src/locales/`

#### Alterações de chaves (renomear as chaves, igual em todos os idiomas):

- [x] `dashboard.tabs.islands` → `dashboard.tabs.continents`
- [x] Bloco `"islands"` → bloco `"continents"` (renomear a chave raiz)
- [x] Dentro do bloco: `"col_island"` → `"col_continent"`
- [x] `mines.col_island` → `mines.col_continent`
- [x] `production.col_island` → `production.col_continent`
- [x] `register.continents` → `register.game_modes`
- [x] `register.islands` → `register.continents`
- [x] `register.continent_name` → `register.game_mode_name`
- [x] `register.island_name` → `register.continent_name`
- [x] `register.select_continent` → `register.select_game_mode`
- [x] `register.select_island` → `register.select_continent`

#### Alterações de valores por idioma (o que aparece na tela):

**`pt.json`**
- [x] `"Ilhas ({{count}})"` → `"Continentes ({{count}})"`
- [x] `"Ilhas"` (header) → `"Continentes"`
- [x] `"Ilha"` (col_continent) → `"Continente"`
- [x] `"Continentes"` (register.game_modes) → `"Modos de Jogo"`
- [x] `"Ilhas"` (register.continents) → `"Continentes"`
- [x] `"Nome do continente"` (register.game_mode_name) → `"Nome do modo de jogo"`
- [x] `"Nome da ilha"` (register.continent_name) → `"Nome do continente"`
- [x] `"Continente…"` (register.select_game_mode) → `"Modo de Jogo…"`
- [x] `"Ilha…"` (register.select_continent) → `"Continente…"`

**`en.json`**
- [x] `"Islands ({{count}})"` → `"Continents ({{count}})"`
- [x] `"Islands"` → `"Continents"`
- [x] `"Island"` → `"Continent"`
- [x] `"Continents"` → `"Game Modes"`
- [x] `"Islands"` (register) → `"Continents"`
- [x] `"Continent name"` → `"Game mode name"`
- [x] `"Island name"` → `"Continent name"`
- [x] `"Continent…"` → `"Game Mode…"`
- [x] `"Island…"` → `"Continent…"`

**`es.json`**
- [x] `"Islas ({{count}})"` → `"Continentes ({{count}})"`
- [x] `"Islas"` → `"Continentes"`
- [x] `"Isla"` → `"Continente"`
- [x] `"Continentes"` (register.game_modes) → `"Modos de Juego"`
- [x] `"Islas"` (register.continents) → `"Continentes"`
- [x] `"Nombre del continente"` → `"Nombre del modo de juego"`
- [x] `"Nombre de la isla"` → `"Nombre del continente"`
- [x] `"Continente…"` → `"Modo de Juego…"`
- [x] `"Isla…"` → `"Continente…"`

**`de.json`**
- [x] `"Inseln ({{count}})"` → `"Kontinente ({{count}})"`
- [x] `"Inseln"` → `"Kontinente"`
- [x] `"Insel"` → `"Kontinent"`
- [x] `"Kontinente"` (register.game_modes) → `"Spielmodi"`
- [x] `"Inseln"` (register.continents) → `"Kontinente"`
- [x] `"Kontinentname"` → `"Spielmodusname"`
- [x] `"Inselname"` → `"Kontinentname"`
- [x] `"Kontinent…"` → `"Spielmodus…"`
- [x] `"Insel…"` → `"Kontinent…"`

**`fr.json`**
- [x] `"Îles ({{count}})"` → `"Continents ({{count}})"`
- [x] `"Îles"` → `"Continents"`
- [x] `"Île"` → `"Continent"`
- [x] `"Continents"` (register.game_modes) → `"Modes de jeu"`
- [x] `"Îles"` (register.continents) → `"Continents"`
- [x] `"Nom du continent"` → `"Nom du mode de jeu"`
- [x] `"Nom de l'île"` → `"Nom du continent"`
- [x] `"Continent…"` → `"Mode de jeu…"`
- [x] `"Île…"` → `"Continent…"`

**`it.json`**
- [x] `"Isole ({{count}})"` → `"Continenti ({{count}})"`
- [x] `"Isole"` → `"Continenti"`
- [x] `"Isola"` → `"Continente"`
- [x] `"Continenti"` (register.game_modes) → `"Modalità di gioco"`
- [x] `"Isole"` (register.continents) → `"Continenti"`
- [x] `"Nome del continente"` → `"Nome della modalità di gioco"`
- [x] `"Nome dell'isola"` → `"Nome del continente"`
- [x] `"Continente…"` → `"Modalità di gioco…"`
- [x] `"Isola…"` → `"Continente…"`

**`nl.json`**
- [x] `"Eilanden ({{count}})"` → `"Continenten ({{count}})"`
- [x] `"Eilanden"` → `"Continenten"`
- [x] `"Eiland"` → `"Continent"`
- [x] `"Continenten"` (register.game_modes) → `"Spelmodi"`
- [x] `"Eilanden"` (register.continents) → `"Continenten"`
- [x] `"Naam van het continent"` → `"Naam van de spelmodus"`
- [x] `"Naam van het eiland"` → `"Naam van het continent"`
- [x] `"Continent…"` → `"Spelmodus…"`
- [x] `"Eiland…"` → `"Continent…"`

### Passo 5.1 — Rebuild frontend após i18n

- [x] Executar:
```bash
sg docker -c "docker compose -p app_idle_dev up --build -d frontend"
```
- [ ] Verificar no browser que os textos estão corretos em PT e EN.

---

## FASE 6 — CSS

> **⚠️ Análise de tokens:** Fase curta. Pode ser feita junto com a Fase 5 se os tokens permitirem.

- [x] Buscar por todas as classes CSS no projeto:
```bash
grep -r "island\|continent-select\|col-ilha" frontend/src --include="*.css" --include="*.tsx" -l
```
- [x] Para cada arquivo encontrado, renomear:

| Classe antiga | Classe nova |
|---|---|
| `.continent-select` | `.game-mode-select` |
| `.islands-table-header` | `.continents-table-header` |
| `.islands-list` | `.continents-list` |
| `.island-row` | `.continent-row` |
| `.island-title` | `.continent-title` |
| `.promo-island-row` | `.promo-continent-row` |
| `.prestige-island-name` | `.prestige-continent-name` |
| `.col-ilha` | `.col-continente` |

> **Importante:** Renomear tanto na definição CSS quanto no uso `className=` nos `.tsx`.

---

## FASE 7 — Documentação

> **⚠️ Análise de tokens:** Fase leve. Pode ser feita ao final da última sessão.

### Passo 7.1 — Criar `docs/alteracao_0043.md`

- [x] Criar o arquivo com o seguinte conteúdo:

```markdown
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
```

### Passo 7.2 — Atualizar `CLAUDE.md`

- [x] Ler o arquivo `CLAUDE.md`.
- [x] Atualizar a tabela de rotas (Seção "Rotas de Backend"):
  - `/api/continents` → `/api/game-modes`
  - `/api/islands?continent_id=` → `/api/continents?game_mode_id=`
  - `/api/mines?island_id=&continent_id=` → `/api/mines?continent_id=&game_mode_id=`
- [x] Atualizar a seção "Banco de Dados — Tabelas":
  - `continents` → `game_modes`
  - `islands` → `continents`
  - Campo `continent_id` → `game_mode_id` (em continents)
  - Campo `island_id` → `continent_id` (em mines)
- [x] Atualizar estrutura de arquivos:
  - `routes/continents.ts` → `routes/game_modes.ts`
  - `routes/islands.ts` → `routes/continents.ts`
  - Componentes renomeados
- [x] Atualizar "Funcionalidades Implementadas" — trocar referências a "ilhas" por "continentes"
- [x] Atualizar "Componentes Frontend" — nomes novos
- [x] Atualizar próximo número de alteração: `0043` → `0044`

---

## FASE 8 — Verificação Final

> Esta fase deve ser feita em nova sessão, com contexto limpo.

### Passo 8.1 — Rebuild completo

- [x] Executar rebuild completo de tudo:
```bash
sg docker -c "docker compose -p app_idle_dev up --build -d"
```

### Passo 8.2 — Verificar sem resíduos

- [x] Buscar por referências antigas que possam ter ficado para trás:
```bash
grep -r "island_id\|islandsRouter\|IslandPanel\|DetalheIlhaPanel\|/api/islands\|api\.islands\|api\.continents\b" \
  backend/src frontend/src --include="*.ts" --include="*.tsx" --include="*.json" \
  --exclude-dir=node_modules
```
Qualquer resultado deve ser investigado e corrigido.

- [x] Buscar por `Island` como tipo TypeScript:
```bash
grep -r "\bIsland\b\|\bContinent\b" frontend/src --include="*.ts" --include="*.tsx"
```
Só deve aparecer `Continent` e `GameMode` — não `Island` nem o `Continent` antigo.

### Passo 8.3 — Teste manual no browser

- [x] Abrir o app
- [x] Verificar aba "Continentes" (ex-Ilhas): lista os continentes, expande minas
- [x] Verificar header: select de "Modo de Jogo" filtra os continentes
- [x] Verificar aba "Cadastros": seções "Modos de Jogo", "Continentes", "Minas" funcionando
- [x] Verificar aba "Resumo": cards por continente
- [x] Verificar aba "Produção": tabela por continente
- [x] Verificar aba "Promoção": simulação por continente
- [x] Trocar idioma para EN e verificar os textos

> **Nota:** Durante a verificação foi detectado e corrigido um resíduo nos 7 locales: `summary.header` ainda dizia "Ilha/Island/Insel/..." em vez de "Continente/Continent/Kontinent/...". Corrigido em todos os idiomas.

### Passo 8.4 — Commit

- [ ] Fazer o commit na branch `develop`:
```bash
git add -A
git commit -m "refactor: renomear Island→Continent e Continent→GameMode (#0043)

Alinha terminologia do código com nomenclatura oficial do jogo.
O que o jogo chama de Continente era Island; Modo de Jogo era Continent."
```

---

## Resumo das Fases

| Fase | Descrição | Arquivos | Tokens estimados |
|---|---|---|---|
| 1 | Banco de Dados (2 migrations) | 2 novos | Baixo |
| 2 | Backend (rotas + index) | 4 editados, 1 removido | Médio |
| 3 | Frontend types + API client | 2 editados | Baixo |
| 4 | Frontend componentes | 8 editados, 2 renomeados | Alto — nova sessão |
| 5 | i18n (7 idiomas) | 7 editados | Médio-Alto |
| 6 | CSS | ~3-5 editados | Baixo |
| 7 | Documentação | 2 editados, 1 novo | Baixo |
| 8 | Verificação + commit | — | Baixo — nova sessão |

**Total de arquivos:** ~28 arquivos modificados/criados, 3 removidos.
