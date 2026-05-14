# Alteração 0001 — Setup inicial do projeto

**Data:** 2026-05-13
**Tipo:** feat

## O que foi alterado

Criação completa da estrutura do projeto do zero.

## Motivação

Converter a planilha `Idle_v2.1.xlsx` (tracker de jogo idle de mineração) em uma aplicação web com interface interativa para inserir e visualizar dados do jogo.

## Arquivos criados

### Raiz
- `CLAUDE.md` — regras de desenvolvimento (documentação, Docker, stack)
- `docker-compose.yml` — orquestração dos 3 serviços: db, backend, frontend
- `.env.example` / `.env` — variáveis de ambiente
- `.gitignore`

### Backend (`backend/`)
- `Dockerfile` — Node 20 Alpine, ts-node-dev
- `package.json` — Express, pg, cors, typescript
- `tsconfig.json`
- `src/db.ts` — pool PostgreSQL + runner de migrações
- `src/index.ts` — servidor Express com CORS e rotas
- `src/routes/mines.ts` — GET /api/mines, PUT /api/mines/:nome
- `src/routes/prestige.ts` — GET /api/prestige, PUT /api/prestige/:minaNome
- `src/routes/islands.ts` — GET /api/islands, PUT /api/islands/:nome
- `src/routes/gameState.ts` — GET/PUT /api/game, GET /api/game/factors
- `src/migrations/001_initial.sql` — schema + seed (fatores, minas, ilhas, prestígio, estado do jogo)

### Frontend (`frontend/`)
- `Dockerfile` — Node 20 Alpine, Vite dev server
- `package.json` — React 18, Vite, TypeScript
- `tsconfig.json`, `vite.config.ts` — proxy `/api` → backend
- `index.html`
- `src/types/index.ts` — interfaces TypeScript
- `src/api/client.ts` — wrapper fetch para todas as rotas
- `src/components/Dashboard.tsx` — layout principal com tabs
- `src/components/MineCard.tsx` — card por mina com form de edição
- `src/components/PrestigePanel.tsx` — painel de prestígio por mina
- `src/components/IslandPanel.tsx` — painel de ilhas
- `src/index.css` — tema escuro completo

## Schema do banco

- `factors` — tabela de notação (-, k, m, b, t, aa…bz)
- `mines` — minas com Armazém, Elevador, Extração
- `prestige` — prestígio por mina
- `islands` — ilhas com próxima gem e tempo restante
- `game_state` — estado global (fator mult., nível atual, meta)

## Como rodar

```bash
cp .env.example .env
docker compose up --build
```

Acesso:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- PostgreSQL: localhost:5432
