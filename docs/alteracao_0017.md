# Alteração 0017 — Estrela de prestígio máximo na tabela de minas

**Data:** 2026-05-13
**Tipo:** feat

## O que foi alterado

- Na coluna de status da `MinesTable`, quando `prestigio_atual > 0` e `prestigio_atual === prestigio_maximo`, exibe uma estrela (★) abaixo do bullet de status.
- CSS `.prestige-star`: 11px, cor `--warn` (amarelo), centralizada na célula.

## Motivação

Indicação visual rápida de quais minas já atingiram o prestígio máximo.

## Arquivos modificados

- `frontend/src/components/MinesTable.tsx`
- `frontend/src/index.css`
