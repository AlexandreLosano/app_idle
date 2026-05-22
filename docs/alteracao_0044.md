# Alteração 0044 — Favicon e título dinâmico da aba do navegador

**Data:** 2026-05-22
**Tipo:** feat

## O que foi alterado
- Adicionado favicon SVG (picareta) servido via `frontend/public/favicon.svg`
- Referenciado no `index.html` com `<link rel="icon">`
- Título da aba agora é dinâmico em `App.tsx`: `[DEV] Idle Miner Tycom - Tracker` em DEV e `Idle Miner Tycom - Tracker` em PRD, usando a mesma lógica de `isDevHost()` já existente

## Motivação
Melhorar a identidade visual da aba do navegador e facilitar a distinção entre ambientes DEV e PRD.

## Arquivos modificados
- `frontend/public/favicon.svg` (novo)
- `frontend/index.html`
- `frontend/src/App.tsx`
