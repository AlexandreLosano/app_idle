# Alteração 0027 — Tela de Produção por Período

**Data:** 2026-05-17
**Tipo:** feat

## O que foi alterado

Nova aba "Produção" com tabela listando todas as ilhas do continente ativo e a produção calculada em múltiplos períodos: por segundo, por minuto, por hora, por dia e por semana.

Inclui linha de total consolidado no rodapé da tabela.

## Motivação

Facilitar a leitura da produção acumulada ao longo do tempo sem necessidade de cálculo manual.

## Lógica

A produção raw (por segundo) de cada ilha é obtida pelo mesmo `computeProduction` já utilizado nas outras telas. Os demais períodos são multiplicações simples:

| Período | Multiplicador |
|---------|--------------|
| /s      | × 1          |
| /min    | × 60         |
| /hora   | × 3.600      |
| /dia    | × 86.400     |
| /semana | × 604.800    |

## Arquivos modificados

- `frontend/src/components/ProducaoPanel.tsx` — novo componente
- `frontend/src/components/Dashboard.tsx` — nova aba + import
- `frontend/src/index.css` — estilos da tabela
