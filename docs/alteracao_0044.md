# Alteração 0044 — Favicon, título dinâmico e prestígios nos cards de Resumo

**Data:** 2026-05-22
**Tipo:** feat

## O que foi alterado
- Adicionado favicon SVG (picareta) servido via `frontend/public/favicon.svg`
- Referenciado no `index.html` com `<link rel="icon">`
- Título da aba agora é dinâmico em `App.tsx`: `[DEV] Idle Miner Tycom - Tracker` em DEV e `Idle Miner Tycom - Tracker` em PRD, usando a mesma lógica de `isDevHost()` já existente
- Cards de continente na aba Resumo agora exibem `Prestígios: X / Y` (realizados / total possível)
- Adicionada chave i18n `summary.prestigios_label` em todos os 7 idiomas

## Motivação
Melhorar a identidade visual da aba do navegador, facilitar a distinção entre ambientes DEV e PRD, e dar visibilidade rápida do progresso de prestígio por continente no Resumo.

## Arquivos modificados
- `frontend/public/favicon.svg` (novo)
- `frontend/index.html`
- `frontend/src/App.tsx`
- `frontend/src/components/SummaryPanel.tsx`
- `frontend/src/locales/pt.json`, `en.json`, `de.json`, `es.json`, `fr.json`, `it.json`, `nl.json`
