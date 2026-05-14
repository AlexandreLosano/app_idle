# Alteração 0008 — Exibe menor valor de próximo prestígio no header da ilha

**Data:** 2026-05-13
**Tipo:** feat

## O que foi alterado

Adicionada função `minNextPrestige` em `IslandPanel.tsx` que encontra a mina com o menor `proximo_prestigio_valor` (comparando pela escala de letras via score) entre as minas da ilha. O valor é exibido no header de cada ilha ao lado da produção, em amarelo para distinguir visualmente.

## Motivação

Facilita ver de uma vez qual mina da ilha está mais próxima de um prestígio sem precisar expandir a lista.

## Arquivos modificados

- `frontend/src/components/IslandPanel.tsx`
- `frontend/src/index.css`
