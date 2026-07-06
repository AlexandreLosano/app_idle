# Alteração 0050 — Fix: badge Balanço incorreto em continente maxado

**Data:** 2026-07-06
**Tipo:** fix

## O que foi alterado

Duas correções em `continentBalance` em `ContinentPanel.tsx`:

1. **Continente maxado:** quando `isMaxed = true`, agora usa `fator_rendimento` para ranquear as minas (igual ao `MinesTable`), em vez de `proximo_prestigio_valor`.

2. **Critério de agregação:** substituído `maxDiff` por **média dos `rankDiff` individuais** (cap em 2), espelhando exatamente os badges por mina do `MinesTable`. Regra:
   - média = 0 → ok (verde)
   - 0 < média ≤ 1 → warn (amarelo)
   - média > 1 → bad (vermelho)

## Motivação

O continente Gelo (30/30 prestígios) exibia badge "Trabalhar" vermelho incorretamente. Além disso, o critério anterior (max) era muito rígido — um único outlier tornava o continente inteiro vermelho, independente das demais minas estarem alinhadas.

## Arquivos modificados

- `frontend/src/components/ContinentPanel.tsx`
