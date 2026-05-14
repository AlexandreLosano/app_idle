# Idle Miner Tycom - Tracker

Tracker para o jogo Idle Miner Tycom. Registra e calcula produção, prestígio e progresso por continente, ilha e mina, com base nos dados da planilha `Idle_v2.1.xlsx`.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + TypeScript + CSS puro |
| Backend | Node.js + TypeScript + Express + node-postgres |
| Banco | PostgreSQL 16 |
| Infra | Docker + Docker Compose |

## Funcionalidades

- **Resumo** — visão geral com produção total, cards por ilha (produção + próximo prestígio + tempo estimado), gráfico discreto de prestígio por ilha e rosca comparativa do total geral
- **Ilhas** — lista expansível por ilha com header mostrando produção, próximo prestígio, tempo e indicador de balanço (Equilibrado / Trabalhar); edição inline de cada mina com botão salvar por linha
- **Minas** — tabela somente leitura com filtro por ilha, coluna de ordem de prestígio com bullet de validação e percentual de contribuição por ilha
- **Boosters / Artefatos** — gestão de artefatos ativos/inativos e configuração de booster (comprados + multiplicador de anúncio)
- **Cadastros** — criação e edição de Continentes, Ilhas e Minas com select de edição inline por entidade

## Multi-Continente

O app suporta múltiplos continentes. O select no header filtra toda a interface (Resumo, Ilhas, Minas) para exibir apenas as ilhas e minas do continente ativo. Novos continentes, ilhas e minas são criados e editados pela aba **Cadastros**.

## Sistema de Notação

O jogo usa letras para representar ordens de grandeza:

| Letra | Valor |
|-------|-------|
| `-` | 1 |
| `k` | 10³ |
| `m` | 10⁶ |
| `b` | 10⁹ |
| `t` | 10¹² |
| `aa` | 10¹⁵ |
| `ab` | 10¹⁸ |
| `...` | +3 por letra |
| `au` | 10⁷⁵ |
| `av` | 10⁷⁸ |

## Fórmula de Produção

```
Produção = bottleneck_nivel × (boosterTotal / 10)

boosterTotal = ROUND((somaArtefatosAtivos + totalComprado) × multiplicadorAnuncio, 1)

bottleneck = mínimo entre Armazém, Elevador e Extração (por score de letra + nível)
```

## Pré-requisitos

- Docker e Docker Compose instalados

## Como rodar

```bash
# Copiar variáveis de ambiente
cp .env.example .env

# Subir todos os serviços
docker compose up -d

# Acompanhar logs
docker compose logs -f

# Acessar o app
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
```

## Comandos úteis

```bash
docker compose up --build          # Rebuild e sobe
docker compose exec backend sh     # Shell no backend
docker compose exec db psql -U idle_user -d idle_db   # Acesso ao banco
docker compose logs -f backend     # Logs do backend
```

## Banco de Dados

Migrações ficam em `backend/src/migrations/` e são aplicadas automaticamente na inicialização do backend. Nunca alterar migração já aplicada — sempre criar nova com próximo número sequencial.

## Estrutura

```
app_idle/
├── CLAUDE.md               # Regras de desenvolvimento
├── docker-compose.yml
├── docs/                   # Histórico de alterações (alteracao_XXXX.md)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Dashboard.tsx
│       │   ├── SummaryPanel.tsx
│       │   ├── IslandPanel.tsx
│       │   ├── MinesTable.tsx
│       │   ├── ArtefatosPanel.tsx
│       │   ├── BoosterBar.tsx
│       │   └── CadastrosPanel.tsx
│       ├── api/client.ts
│       ├── types/index.ts
│       └── index.css
└── backend/
    └── src/
        ├── routes/
        │   ├── mines.ts
        │   ├── islands.ts
        │   ├── continents.ts
        │   ├── artefatos.ts
        │   ├── prestige.ts
        │   └── gameState.ts
        └── migrations/
            └── 001_initial.sql … 012_continents.sql
```

## Histórico de Alterações

Todas as mudanças estão documentadas em [`docs/`](docs/) com o formato `alteracao_XXXX.md`.
