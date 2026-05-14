# Idle Tracker — Guia de Desenvolvimento

## Regras Obrigatórias

### 1. Documentação de Alterações
Toda alteração de código deve ser documentada em `/docs/alteracao_XXXX.md` (número sequencial com 4 dígitos).

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
docker compose up -d            # Sobe todos os serviços em background
docker compose up --build       # Rebuild e sobe
docker compose exec backend sh  # Shell no backend
docker compose exec db psql -U idle_user -d idle_db  # Acesso ao banco
docker compose logs -f backend  # Logs do backend
```

### 3. Banco de Dados
- PostgreSQL exclusivamente
- Migrações em `backend/src/migrations/` numeradas sequencialmente
- Nunca alterar migração já aplicada — sempre criar nova

### 4. Stack
- **Frontend:** React + Vite + TypeScript + CSS puro (sem framework CSS)
- **Backend:** Node.js + TypeScript + Express + pg (node-postgres)
- **Banco:** PostgreSQL 16
- **Containerização:** Docker + Docker Compose

## Estrutura do Projeto

```
app_idle/
├── CLAUDE.md
├── docker-compose.yml
├── .env.example
├── docs/
│   └── alteracao_0001.md
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
│       └── components/
│           ├── Dashboard.tsx
│           ├── MineCard.tsx
│           ├── PrestigePanel.tsx
│           └── IslandPanel.tsx
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts
        ├── db.ts
        ├── routes/
        │   ├── mines.ts
        │   ├── prestige.ts
        │   ├── islands.ts
        │   └── gameState.ts
        └── migrations/
            └── 001_initial.sql
```

## Sobre a Aplicação

Tracker para jogo idle de mineração. Dados baseados na planilha `Idle_v2.1.xlsx`.

### Sistema de Notação
O jogo usa letras para representar ordens de magnitude:
`- = 1`, `k = 10³`, `m = 10⁶`, `b = 10⁹`, `t = 10¹²`, `aa = 10¹⁵`, `ab = 10¹⁸`, ...

### Entidades Principais
- **Minas:** Carvão, Ouro, Rubi, Diamante, Esmeralda (+ ilhas extras)
  - Cada mina tem: Armazém (nível + valor), Elevador (nível + valor), Extração (nível + valor)
  - Valor efetivo = mínimo dos três (gargalo)
- **Estado do Jogo:** Fator multiplicador, nível atual, meta
- **Prestígio:** Por mina — nível atual, GAP, verificação, valor offline
- **Ilhas:** Principal, Gelo, Fogo, Aurora, Crepúsculo, Antigo — próxima gem, valor, tempo restante
