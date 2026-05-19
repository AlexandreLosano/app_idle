# Idle Tracker — Guia de Desenvolvimento

## Regras Obrigatórias

### 1. Documentação de Alterações
Toda alteração de código deve ser documentada em `/docs/alteracao_XXXX.md` (número sequencial com 4 dígitos). Próximo número: **0031**.

Formato:
```
# Alteração XXXX — <título>
**Data:** YYYY-MM-DD
**Tipo:** feat | fix | refactor | chore
## O que foi alterado
## Motivação
## Arquivos modificados
```

### 2. Docker — tudo containerizado
- Nunca rodar nada local (sem `npm run dev` fora do Docker, sem `psql` local, etc.)
- Usar `docker compose up` para subir o ambiente
- Usar `docker compose exec` para acessar containers
- Build: `docker compose build`
- Logs: `docker compose logs -f`

Comandos úteis:
```bash
docker compose up -d                                          # Sobe todos os serviços em background
docker compose up --build                                     # Rebuild e sobe
docker compose exec backend sh                                # Shell no backend
docker compose exec db psql -U idle_user -d idle_db          # Acesso ao banco
docker compose logs -f backend                                # Logs do backend
sg docker -c "docker compose up --build -d backend"          # Rebuild backend (sem sudo)
```

### 3. Banco de Dados
- PostgreSQL exclusivamente
- Migrações em `backend/src/migrations/` numeradas sequencialmente
- Nunca alterar migração já aplicada — sempre criar nova
- O backend aplica migrações automaticamente no startup (`runMigrations()` em `db.ts`)

### 4. Stack
- **Frontend:** React + Vite + TypeScript + CSS puro (sem framework CSS)
- **Backend:** Node.js + TypeScript + Express + pg (node-postgres)
- **Banco:** PostgreSQL 16
- **Containerização:** Docker + Docker Compose

---

## Estrutura do Projeto

```
app_idle/
├── CLAUDE.md
├── docker-compose.yml
├── .env.example
├── docs/
│   └── alteracao_0001.md … alteracao_0030.md
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── types/index.ts
│       ├── api/client.ts
│       ├── utils/
│       │   └── upgradeAdvisor.ts
│       └── components/
│           ├── Dashboard.tsx
│           ├── IslandPanel.tsx
│           ├── MinesTable.tsx
│           ├── SummaryPanel.tsx
│           ├── ArtefatosPanel.tsx
│           ├── BoosterBar.tsx
│           ├── CadastrosPanel.tsx
│           ├── ProducaoPanel.tsx
│           ├── PromocaoPanel.tsx
│           └── UpgradeArrow.tsx
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts
        ├── db.ts
        ├── routes/
        │   ├── artefatos.ts
        │   ├── continents.ts
        │   ├── gameState.ts
        │   ├── islands.ts
        │   └── mines.ts
        └── migrations/
            ├── 001_initial.sql
            ├── 002_island_fk_and_reseed.sql
            ├── 003_simplify_schema.sql
            ├── 004_proximo_prestigio.sql
            ├── 005_artefatos.sql
            ├── 006_boosters_config.sql
            ├── 007_total_comprado.sql
            ├── 008_config_em_artefatos.sql
            ├── 009_seed_aurora_onward.sql
            ├── 010_drop_boosters_config.sql
            ├── 011_drop_valor_minimo.sql
            ├── 012_continents.sql
            ├── 013_drop_unused_columns.sql
            ├── 014_target_pct.sql
            └── 015_mult_off.sql
```

---

## Rotas de Backend

Prefixo base: `/api`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/game/factors` | Lista fatores de magnitude (letra, cont) |
| GET | `/api/continents` | Lista continentes |
| POST | `/api/continents` | Cria continente |
| PUT | `/api/continents/:id` | Edita continente |
| GET | `/api/islands?continent_id=` | Lista ilhas (filtro opcional por continente) |
| POST | `/api/islands` | Cria ilha |
| PUT | `/api/islands/:id` | Edita ilha |
| GET | `/api/mines?island_id=&continent_id=` | Lista minas (filtros opcionais) |
| POST | `/api/mines` | Cria mina |
| PUT | `/api/mines/:nome` | Atualiza dados de uma mina |
| GET | `/api/artefatos` | Lista artefatos (apenas registros com `quantidade IS NOT NULL`) |
| POST | `/api/artefatos` | Cria artefato |
| PUT | `/api/artefatos/:id` | Atualiza artefato (ativo, tipo) |
| GET | `/api/artefatos/config` | Retorna config: `buster_anuncio`, `total_comprado`, `target_pct`, `mult_off` |
| PUT | `/api/artefatos/config` | Salva um ou mais campos de config |

---

## Banco de Dados — Tabelas

### `factors`
Fatores de magnitude do jogo. Populados na migração 001 e limpos na 013.
- `letra` (PK), `cont` (ordem: 1=`-`, 2=`k`, 3=`m`, …)

### `continents`
Continentes (contextos de jogo separados).
- `id`, `nome`, `updated_at`

### `islands`
Ilhas pertencentes a um continente.
- `id`, `nome`, `continent_id` (FK → continents), `updated_at`

### `mines`
Minas pertencentes a uma ilha.
- `id`, `nome`, `island_id` (FK → islands)
- `armazem_nivel`, `armazem_letra`
- `elevador_nivel`, `elevador_letra`
- `extracao_nivel`, `extracao_letra`
- `prestigio_atual`, `prestigio_maximo`
- `proximo_prestigio_valor`, `proximo_prestigio_letra`
- `updated_at`

### `artefatos`
Duplo uso: artefatos reais (quantidade IS NOT NULL) e configs (quantidade IS NULL).
- `id`, `quantidade` (nullable), `tipo`, `ativo`, `valor` (nullable), `updated_at`

**Registros de config** (quantidade = NULL, identificados pelo campo `tipo`):
| tipo | valor padrão | descrição |
|------|-------------|-----------|
| `buster_anuncio` | — | multiplicador de anúncio (ex: 4, 1000, 5000) |
| `total_comprado` | — | total de artefatos comprados fora do jogo |
| `target_pct` | 10 | % do próximo prestígio usado como meta nas setas de upgrade |
| `mult_off` | 3 | multiplicador de anúncio offline (tela Produção) |

---

## Funcionalidades Implementadas

### Abas do Dashboard
1. **Resumo** — Visão geral de todas as ilhas: produção total, próximo prestígio, tempo estimado, barra de prestígio e donut chart
2. **Ilhas** — Lista de ilhas em layout de tabela com colunas alinhadas:
   - Bullet de extração (verde = todas as minas têm extração como gargalo; vermelho = ao menos uma não tem)
   - Produção/s, Próx. Prestígio, Tempo estimado com cores por faixa, Balanço
   - Tempo: ≤10d verde · 11–30d amarelo · 31d–1A vermelho · >1A roxo
   - Tooltip no tempo mostra data estimada de chegada ao prestígio
   - Ao expandir: tabela de minas com setas de upgrade (↑ ↑↑ ↑↑↑)
3. **Boosters / Artefatos** — Gerenciamento de artefatos ativos/inativos; slider de `% do Target` com botão Salvar
4. **Produção** — Tabela por ilha: produção /s /min /hora /dia /semana; multiplicador offline com botão Salvar; coluna /hora destacada em amarelo se ≥ próximo prestígio
5. **Promoção** — Simulação de pacotes promocionais: inserir N artefatos com multiplicador e duração independentes; cálculo segmentado de produção acumulada; mostra se cada ilha atinge o próximo prestígio
6. **Cadastros** — CRUD de continentes e ilhas

### Lógica de Negócio

#### Sistema de Notação
O jogo usa letras para representar ordens de magnitude:
`-=1`, `k=10³`, `m=10⁶`, `b=10⁹`, `t=10¹²`, `aa=10¹⁵`, `ab=10¹⁸`, …

Cada letra tem um `cont` (1, 2, 3, …). Valor absoluto (raw): `nivel × 1000^(cont-1)`.

Score para comparação: `(cont - 1) * 100 + log10(nivel)`.

#### Produção de uma ilha
Soma dos gargalos de cada mina (mínimo entre armazém, elevador, extração).  
Normalizado para a maior letra presente, depois multiplicado pelo booster.

#### Booster Total
`(somaOff + totalComprado) × busterAnuncio × 10`  
onde `somaOff` = soma das quantidades dos artefatos ativos.

Fator aplicado à produção: `boosterTotal / 10`.

#### Setas de Upgrade (`upgradeAdvisor.ts`)
- `effectiveTarget = nextPrestigeRaw × targetPct / 100`
- `boostedBottleneck = bottleneckRaw × boosterFactor`
- Compara `boostedBottleneck` vs `effectiveTarget`
- Intensidade: letra diff = `floor(log10(target/bottleneck) / 3)` → ↑ (0–1) · ↑↑ (2) · ↑↑↑ (3+)

#### Simulação de Promoção (`PromocaoPanel`)
- Artefatos da promoção são **somados** aos já ativos
- Cada artefato tem duração própria; cálculo segmentado por tempo (ordena durações, acumula produção por segmento)
- Compara acumulado com o menor `nextPrestige.raw` da ilha

---

## Componentes Frontend

| Componente | Responsabilidade |
|-----------|-----------------|
| `Dashboard.tsx` | Orquestração de abas, carregamento de dados, estado global |
| `IslandPanel.tsx` | Tabela de ilhas com expansão por ilha para ver minas |
| `MinesTable.tsx` | Tabela editável de minas (usada em IslandPanel) |
| `SummaryPanel.tsx` | Cards de resumo por ilha com barras e donut charts |
| `ArtefatosPanel.tsx` | Lista de artefatos com toggle ativo/inativo e edição de tipo |
| `BoosterBar.tsx` | Barra de resumo do booster total (usada em IslandPanel e SummaryPanel) |
| `ProducaoPanel.tsx` | Tabela de produção por período com multiplicador offline |
| `PromocaoPanel.tsx` | Simulador de pacotes promocionais |
| `CadastrosPanel.tsx` | CRUD de continentes e ilhas |
| `UpgradeArrow.tsx` | Renderiza seta de upgrade (↑/↑↑/↑↑↑) com cor |

| Util | Responsabilidade |
|------|-----------------|
| `upgradeAdvisor.ts` | Calcula hints de upgrade por mina (`computeUpgradeHints`, `formatRaw`) |

### 5. Internacionalização (i18n)
- Biblioteca: `react-i18next` + `i18next`
- Arquivos de tradução em `frontend/src/locales/{lang}.json`
- Idiomas suportados: `pt` (padrão), `en`, `de`, `fr`, `es`, `it`, `nl`
- Idioma padrão: `pt`
- Nunca usar texto hardcoded em componentes — sempre `t('chave')`
- Seletor de idioma no header do Dashboard
- Idioma persistido em localStorage

Estrutura de chaves por domínio:
- `common.*`     — rótulos genéricos (salvar, editar, fechar, etc.)
- `islands.*`    — nomes de ilhas
- `mines.*`      — nomes de minas e componentes (armazém, elevador, extração)
- `prestige.*`   — labels de prestígio, tempo, balanço
- `production.*` — labels da aba Produção
- `summary.*`    — labels da aba Resumo
- `boosters.*`   — labels da aba Boosters/Artefatos
- `promo.*`      — labels da aba Promoção
- `register.*`   — labels da aba Cadastros