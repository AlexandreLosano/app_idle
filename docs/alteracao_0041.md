# Alteração 0041 — Bloqueio visual de células com valor 800 nas colunas 25–35

**Data:** 2026-05-21
**Tipo:** feat

## O que foi alterado
- Colunas de nível 25 a 35 na tela Detalhe de Ilha: quando o valor digitado é `800`, a célula passa a ser exibida em Azul Ciano e a edição é bloqueada (`readOnly`).
- A cor ciano tem prioridade sobre as demais cores de ranking (roxo/verde/amarelo/vermelho).

## Motivação
Representar visualmente que o nível atingiu o teto de 800 nessas colunas, impedindo alterações acidentais.

## Arquivos modificados
- `frontend/src/components/DetalheIlhaPanel.tsx` — helper `isCapped800`, tipo de retorno de `getCellColor`, prop `readOnly` e remoção de handlers quando bloqueado.
- `frontend/src/index.css` — nova classe `.detalhe-col-input.cell-cyan`.
