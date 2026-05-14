# Alteração 0009 — Estimativa de tempo para próximo prestígio no header da ilha

**Data:** 2026-05-13
**Tipo:** feat

## O que foi alterado

- `computeProduction` agora retorna `{ display, raw }` — o valor bruto (em unidades base) permite dividir pelo alvo.
- `minNextPrestige` igualmente retorna `{ display, raw }`.
- Nova função `formatTime(seconds)`: converte segundos em string legível (ex: "2d 3h", "45m 12s").
- Header da ilha exibe "Tempo" = `nextPrestige.raw / production.raw` formatado.

## Motivação

Permite estimar offline quanto tempo falta para a próxima rodada de prestígio na ilha sem abrir planilha.

## Arquivos modificados

- `frontend/src/components/IslandPanel.tsx`
