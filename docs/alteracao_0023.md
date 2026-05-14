# Alteração 0023 — Edição inline em Cadastros, título, e ajustes de layout

**Data:** 2026-05-14
**Tipo:** feat | fix

---

## 1. Edição inline nos Cadastros

### O que foi alterado
Substituídas as listas estáticas (`<ul>/<li>`) das seções Continentes e Ilhas por selects de edição. A seção Minas também ganhou o mesmo padrão, agora permitindo editar qualquer mina existente.

Cada seção tem dois blocos independentes:
- **Criar** — formulário de criação (igual a antes)
- **Editar** — select "Selecione para editar…"; ao escolher um item, abre formulário inline pré-preenchido com os dados atuais

| Seção | Campos de edição |
|-------|-----------------|
| Continentes | Nome |
| Ilhas | Nome + Continente |
| Minas | Nome + Continente (filtra ilhas) + Ilha |

Após salvar, o select colapsa e o Dashboard recarrega.

### Novos endpoints backend
- `PUT /api/continents/:id` — atualiza nome do continente
- `PUT /api/islands/:id` — atualiza nome e/ou continent_id da ilha
- `PUT /api/mines/:nome` — agora aceita `nome` no body para renomear a mina (campo adicional, sem quebrar o fluxo existente de edição de produção)

### Novos métodos no api/client.ts
- `api.continents.update(id, { nome })`
- `api.islands.update(id, { nome?, continent_id? })`

### Estilos adicionados
- `.cad-edit-row` — container que empilha select + formulário de edição
- `.cad-edit-form` — formulário inline com fundo `--surface` e borda

### Arquivos modificados
- `backend/src/routes/continents.ts`
- `backend/src/routes/islands.ts`
- `backend/src/routes/mines.ts`
- `frontend/src/api/client.ts`
- `frontend/src/components/CadastrosPanel.tsx`
- `frontend/src/index.css`

---

## 2. Título da aplicação

### O que foi alterado
Título alterado de **"Idle Tracker"** para **"Idle Miner Tycom - Tracker"** em dois lugares:
- Tag `<title>` do HTML (`frontend/index.html`)
- `<h1>` do header no `Dashboard.tsx`

### Arquivos modificados
- `frontend/index.html`
- `frontend/src/components/Dashboard.tsx`

---

## 3. Correção de scroll horizontal

### O que foi alterado
Removido `margin-left: 275px` fixo do `.prestige-donut`, que causava overflow de ~49px na aba Resumo com 8 ilhas.

**Causa raiz:** barras de prestígio (~742px) + margin fixa (275px) + donut (200px) = 1217px > 1168px disponíveis (1200px max-width − 32px padding).

**Correção:** `.prestige-chart-layout` passou a usar `justify-content: space-between` com `.prestige-rows` recebendo `flex: 1; min-width: 0`, posicionando o donut naturalmente à direita sem forçar overflow.

### Arquivos modificados
- `frontend/src/index.css`

---

## 4. Otimização de scroll vertical

### O que foi alterado
Reduzidos espaçamentos em toda a página para que o Resumo com 8 ilhas caiba em telas 768px+ sem scroll vertical. Altura estimada passou de ~756px para ~565px (−191px).

| Elemento | Antes | Depois | Δ |
|---|---|---|---|
| Header padding | 20px + 16px | 12px + 10px | −14px |
| h1 font-size | 22px | 20px | — |
| Tabs padding | 16px + 12px | 10px + 8px | −10px |
| Tab padding vertical | 7px + 7px | 5px + 5px | −4px |
| Panel padding-top | 20px | 12px | −8px |
| Panel h2 margin-bottom | 16px | 10px | −6px |
| BoosterBar padding | 7px + 7px | 5px + 5px | −4px |
| BoosterBar margin-bottom | 16px | 10px | −6px |
| Cards grid gap | 14px | 10px | −4px |
| Cards grid margin-bottom | 28px | 14px | −14px |
| Card padding vertical | 14px + 14px | 10px + 10px | −8px |
| Card gap interno | 8px | 5px | −9px |
| Prestige h2 margin-bottom | 14px | 8px | −6px |
| Prestige rows gap (×7) | 10px | 6px | −28px |
| Pseg dimensão (×8 linhas) | 12×12px | 10×10px | −16px |
| Donut SVG | 200×200px | 160×160px | −40px |
| Dashboard padding-bottom | 40px | 20px | −20px |

### Arquivos modificados
- `frontend/src/index.css`
- `frontend/src/components/SummaryPanel.tsx`
