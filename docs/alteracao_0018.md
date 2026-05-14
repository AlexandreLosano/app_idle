# Alteração 0018 — Página Resumo como tela inicial

**Data:** 2026-05-13
**Tipo:** feat

## O que foi alterado

- Criado `SummaryPanel.tsx` com três seções:
  1. **Produção Total** — card com o somatório de produção de todas as ilhas em notação de letras.
  2. **Gráfico discreto** — SVG com barras por ilha; eixo Y usa as letras do jogo como ticks discretos (cada tick = uma ordem de grandeza). Acima de cada barra aparece `★{total prestige}` em amarelo mostrando os prestígios realizados.
  3. **Próximo Prestígio** — tabela com Ilha, Valor, Mina e Tempo estimado para cada ilha.
- `Dashboard.tsx`: adicionado tab "Resumo" como primeiro tab e página inicial padrão.
- `index.css`: estilos para `.summary-total`, `.summary-chart-wrap`, `.summary-prestige-table`, `.sp-*`.

## Motivação

Criar uma tela inicial com visão consolidada do estado do jogo sem precisar abrir cada ilha individualmente.

## Arquivos modificados

- `frontend/src/components/SummaryPanel.tsx` (novo)
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/index.css`
