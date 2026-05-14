# Alteração 0019 — Resumo redesenhado: cards + gráfico discreto de prestígio

**Data:** 2026-05-13
**Tipo:** feat

## O que foi alterado

- `SummaryPanel.tsx` reescrito:
  - **Grid de cards** (1 por ilha): nome, contagem de minas, produção, próximo prestígio (valor, mina, tempo).
  - **Gráfico discreto de prestígio** abaixo dos cards: para cada ilha, uma barra de segmentos (12×12 px cada) mostrando `sum(prestigio_atual)` preenchidos vs `sum(prestigio_maximo)` total. Máximo de 40 segmentos — se o total passar de 40, cada segmento representa múltiplos de prestígio proporcionalmente. Quando completamente preenchida, a barra fica verde.
- `index.css`: novos estilos para `.summary-cards`, `.summary-card`, `.sc-*`, `.prestige-bar`, `.pseg-on/off`, `.prestige-row`.
- Gráfico de rosca SVG (`DonutChart`) ao lado das barras, mostrando total geral de todas as ilhas. Posicionado com `margin-left: 275px` (posição ideal definida pelo usuário).

## Motivação

Layout anterior usava um único gráfico SVG de barras de produção. Novo layout é mais legível: cards compactos por ilha + gráfico comparativo de progresso de prestígio.

## Arquivos modificados

- `frontend/src/components/SummaryPanel.tsx`
- `frontend/src/index.css`
