# Alteração 0030 — Header de ilhas em grid com tempo colorido e tooltip

**Data:** 2026-05-18
**Tipo:** feat

## O que foi alterado

A linha de resumo de cada ilha na tela Ilhas foi reformulada para layout em grid com colunas alinhadas e cabeçalho de tabela. O campo de tempo ganhou formatação Anos/Meses/Dias/Horas, cores por faixa e tooltip com data estimada de prestígio.

## Motivação

As informações no header de cada ilha ficavam em fluxo livre sem alinhamento. O tempo exibido em dias/horas não dava clareza para prazos longos.

## Regras de cor do tempo
- > 6 meses (180 dias): vermelho
- > 10 dias e ≤ 6 meses: amarelo
- ≤ 10 dias: verde

## Arquivos modificados

- `frontend/src/components/IslandPanel.tsx` — novo `formatTime` (A/M/D/h), `timeColorClass`, `estimatedDateTooltip`; JSX reestruturado em 5 colunas de grid; cabeçalho de tabela adicionado
- `frontend/src/index.css` — estilos de grid (`.islands-table-header`, `.island-summary`, `.isl-col-name`, `.isl-col-val`), `.time-badge` com `.time-green/.time-warn/.time-red`
