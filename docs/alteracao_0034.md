# Alteração 0034 — Ordem de Prestígio por Ilha no Detalhe Ilha

**Data:** 2026-05-19
**Tipo:** fix

## O que foi alterado

No painel Detalhe Ilha, a coluna "Ordem Prestígio" agora classifica as minas dentro da ilha selecionada, não globalmente entre todas as minas de todos os continentes.

## Motivação

O ranking global misturava minas de ilhas diferentes, tornando a posição sem significado prático. O usuário quer saber qual mina da ilha deve prestigiar primeiro, não a posição absoluta entre todas as minas do continente.

## Arquivos modificados

- `frontend/src/components/DetalheIlhaPanel.tsx` — `[...mines]` → `[...islandMines]` no cálculo de `prestigeRanks`
