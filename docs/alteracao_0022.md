# Alteração 0022 — Continentes: multi-contexto por continente

**Data:** 2026-05-14
**Tipo:** feat

## O que foi alterado

### Banco de Dados
- Nova tabela `continents` (`id`, `nome`, `updated_at`) com seed inicial "Normal".
- Coluna `continent_id INTEGER NOT NULL REFERENCES continents(id)` adicionada em `islands`.
- Todas as ilhas existentes associadas ao continente "Normal" via migration.

### Backend
- Nova rota `GET /api/continents` — lista todos os continentes.
- Nova rota `POST /api/continents` — cria novo continente `{ nome }`.
- `GET /api/islands` aceita `?continent_id=X` para filtrar ilhas por continente.
- `POST /api/islands` cria ilha com `{ nome, continent_id }`.
- `GET /api/mines` aceita `?continent_id=X` (JOIN com islands) além de `?island_id=X`.
- `POST /api/mines` cria mina com `{ nome, island_id? }`.

### Frontend — tipos e API
- `Island` recebe campo `continent_id: number`.
- Novo tipo `Continent { id, nome, updated_at }`.
- `api.continents.list()` e `api.continents.create(nome)`.
- `api.islands.list(continent_id?)` e `api.islands.create({ nome, continent_id })`.
- `api.mines.list(island_id?, continent_id?)` e `api.mines.create({ nome, island_id? })`.

### Frontend — Dashboard
- Carrega lista de continentes no mount; primeiro continente é ativado por padrão.
- `<select>` de continente no header — ao trocar, recarrega ilhas e minas filtradas.
- Nova aba **Cadastros** na navegação principal.
- `handleRefresh` passado ao `CadastrosPanel` atualiza continentes + dados do continente ativo.

### Frontend — CadastrosPanel (novo)
Aba com três seções de criação:
| Seção | Campos |
|-------|--------|
| Continentes | Nome |
| Ilhas | Nome + select de continente |
| Minas | Nome + select de continente + select de ilha (filtrada pelo continente) |

Lista de continentes e ilhas cadastrados exibida abaixo de cada formulário.

## Motivação
Suporte a múltiplos continentes no jogo, cada um com seu próprio conjunto de ilhas e minas. A estrutura de visualização (Resumo, Ilhas, Minas, Boosters) reflete automaticamente o continente selecionado no header.

## Arquivos modificados
- `backend/src/migrations/012_continents.sql` (novo)
- `backend/src/routes/continents.ts` (novo)
- `backend/src/routes/islands.ts`
- `backend/src/routes/mines.ts`
- `backend/src/index.ts`
- `frontend/src/types/index.ts`
- `frontend/src/api/client.ts`
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/components/CadastrosPanel.tsx` (novo)
- `frontend/src/index.css`
