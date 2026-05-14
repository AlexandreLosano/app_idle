# Alteração 0007 — Produção total do header da ilha inclui booster

**Data:** 2026-05-13
**Tipo:** feat

## O que foi alterado

A função `computeProduction` em `IslandPanel.tsx` passou a receber e aplicar o `boosterFactor` (`boosterTotal / 10`) na soma das produções das minas da ilha. O arredondamento foi alinhado com o padrão usado na tabela de minas (`roundByMagnitude`).

## Motivação

O header de cada ilha mostrava a produção bruta (soma dos gargalos sem booster), divergindo do valor mostrado por mina na MinesTable.

## Arquivos modificados

- `frontend/src/components/IslandPanel.tsx`
