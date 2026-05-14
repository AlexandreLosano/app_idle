# Alteração 0010 — Preserva edições não salvas e torna ilha somente leitura

**Data:** 2026-05-13
**Tipo:** fix

## O que foi alterado

**Perda de edições ao salvar outra mina:**
- `useEffect` em `MinesTable` agora usa `prev[m.id] ?? toForm(m)` — preserva linhas já editadas e só inicializa linhas novas.
- Após salvar, `setRows(r => ({ ...r, [m.id]: toForm(updated) }))` sincroniza apenas a linha salva com a resposta do servidor.
- Removido `island_id` do payload de save (ilha não é mais editável).

**Coluna Ilha na aba Minas:**
- Substituído `<select>` por `<span>` exibindo `m.island_nome` — a ilha de uma mina é fixa e não deve ser editável por essa tela.

## Arquivos modificados

- `frontend/src/components/MinesTable.tsx`
- `frontend/src/index.css`
