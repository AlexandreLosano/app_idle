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
- **Ilhas** — tabela com colunas alinhadas (Produção/s · Próx. Prestígio · Tempo · Balanço); bullet de extração por ilha (verde = todas as minas têm extração como gargalo); tempo colorido por faixa (verde ≤10d · amarelo ≤1 mês · vermelho ≤1 ano · roxo >1 ano) com tooltip de data estimada; ao expandir mostra tabela de minas editável com setas de upgrade (↑ ↑↑ ↑↑↑)
- **Boosters / Artefatos** — gestão de artefatos ativos/inativos e configuração de booster (multiplicador de anúncio + total comprado); slider de **% do Target** com botão Salvar (persiste no banco)
- **Produção** — tabela por ilha com produção /s /min /hora /dia /semana; campo de multiplicador de anúncio offline com botão Salvar (persiste no banco); coluna /hora destacada em amarelo quando valor ≥ próximo prestígio da ilha
- **Promoção** — simulador de pacotes promocionais: informe um ou mais artefatos com quantidades e durações independentes e veja por ilha se a produção acumulada no período será suficiente para atingir o próximo prestígio
- **Cadastros** — criação e edição de continentes e ilhas com edição inline

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

## Simulação de Promoção

Permite avaliar se vale a pena comprar um pacote promocional de artefatos antes de gastar dinheiro real.

O cálculo considera que cada artefato da promo tem duração própria e expira em momentos diferentes. A produção acumulada é calculada em **segmentos de tempo**:

```
Segmentos ordenados por duração crescente (t1 < t2 < t3 …):

Acumulado = produção(todos ativos) × t1
          + produção(sem os que expiraram em t1) × (t2 - t1)
          + produção(sem os que expiraram em t2) × (t3 - t2)
          + …

Resultado: Acumulado ≥ próximo_prestígio → vai atingir ✓
```

O booster de cada segmento usa a mesma fórmula base, somando apenas os artefatos ainda ativos àquele momento.

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
├── docs/                   # Histórico de alterações (alteracao_0001.md … alteracao_0030.md)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Dashboard.tsx
│       │   ├── SummaryPanel.tsx
│       │   ├── IslandPanel.tsx
│       │   ├── MinesTable.tsx
│       │   ├── ArtefatosPanel.tsx
│       │   ├── BoosterBar.tsx
│       │   ├── ProducaoPanel.tsx
│       │   ├── PromocaoPanel.tsx
│       │   ├── CadastrosPanel.tsx
│       │   └── UpgradeArrow.tsx
│       ├── utils/upgradeAdvisor.ts
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
        │   └── gameState.ts
        └── migrations/
            └── 001_initial.sql … 015_mult_off.sql
```

## Histórico de Alterações

Todas as mudanças estão documentadas em [`docs/`](docs/) com o formato `alteracao_XXXX.md`.

## Pipe Line