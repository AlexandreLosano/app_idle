# Alteração 0040 — Faixa de desenvolvimento + portas configuráveis

**Data:** 2026-05-20
**Tipo:** feat / chore

---

## Motivação

O projeto roda em múltiplas máquinas da rede local (`192.168.0.X`). Uma máquina é tratada como "produção" (IP fixo), as demais como desenvolvimento. Era necessário:

1. Sinalizar visualmente quando o app está sendo acessado em ambiente de desenvolvimento
2. Evitar conflitos de porta com outros projetos locais, tornando as portas de todos os serviços configuráveis via `.env`

---

## O que foi alterado

### Faixa de desenvolvimento

- **`frontend/src/App.tsx`** — adicionada função `isDevHost()` que compara `window.location.hostname` com `VITE_PROD_IP` (variável de ambiente). Se o hostname não coincidir (ou se `VITE_PROD_IP` estiver vazio), renderiza a `<div className="dev-banner">` com o IP atual.
- **`frontend/src/index.css`** — adicionados estilos `.dev-banner` (faixa fixa no topo, listras diagonais laranja) e `body:has(.dev-banner) { padding-top: 26px }` para evitar que o conteúdo fique oculto atrás da faixa.

**Comportamento:**
- Máquinas em desenvolvimento → faixa laranja listrada no topo exibindo o IP (`⚠ DESENVOLVIMENTO — 192.168.0.42`)
- Máquina de produção (`VITE_PROD_IP` coincide) → sem faixa
- `VITE_PROD_IP` não definida → faixa sempre aparece (fail-safe)

---

### Portas configuráveis

Três novas variáveis de ambiente:

| Variável | Padrão | Serviço |
|----------|--------|---------|
| `FRONTEND_PORT` | `5173` | Vite (frontend) |
| `BACKEND_PORT` | `3000` | Express (backend) |
| `POSTGRES_PORT` | `5432` | PostgreSQL |

- **`.env`** — adicionadas as 4 variáveis (`VITE_PROD_IP`, `FRONTEND_PORT`, `BACKEND_PORT`, `POSTGRES_PORT`)
- **`.env.example`** — idem, com comentários explicativos
- **`docker-compose.yml`** — portas de `db`, `backend` e `frontend` agora usam `${VAR:-padrão}`; variável `PORT` do backend atualizada para `${BACKEND_PORT:-3000}`; variáveis `VITE_PORT` e `BACKEND_PORT` passadas ao container frontend para que o Vite as leia
- **`frontend/vite.config.ts`** — porta do servidor e target do proxy lidos de `process.env.VITE_PORT` e `process.env.BACKEND_PORT` (Node.js do Vite, não o browser)

---

### Healthcheck do backend

- **`docker-compose.yml`** — adicionado `healthcheck` ao serviço `backend` usando o endpoint `/health` já existente em `backend/src/index.ts:24`. A porta do healthcheck acompanha `BACKEND_PORT`.

```yaml
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://localhost:${BACKEND_PORT:-3000}/health || exit 1"]
  interval: 10s
  timeout: 5s
  retries: 5
```

---

## Arquivos modificados

- `.env`
- `.env.example`
- `docker-compose.yml`
- `frontend/vite.config.ts`
- `frontend/src/App.tsx`
- `frontend/src/index.css`

## Arquivos não modificados

- `backend/src/index.ts` — sem alteração; o endpoint `/health` já existia
- Nenhum componente de UI alterado

---

## Como usar

1. Preencher `VITE_PROD_IP=192.168.0.X` no `.env` com o IP da máquina de produção
2. Ajustar as portas se necessário (ex: `FRONTEND_PORT=5200` para evitar conflito)
3. Rebuild: `sg docker -c "docker compose up --build -d"`
4. Para trocar porta sem rebuild completo, basta alterar o `.env` e recriar o container:
   `sg docker -c "docker compose up -d --force-recreate frontend"`
