# Alteração 0028 — Persistência do % Target no banco

**Data:** 2026-05-18
**Tipo:** feat

## O que foi alterado

O percentual de target (slider "% do Target exibido") passou a ser salvo no banco de dados via tabela `artefatos`, usando o mesmo padrão das configs existentes (`buster_anuncio`, `total_comprado`).

## Motivação

O valor era salvo apenas em localStorage, sendo perdido ao trocar de navegador ou limpar cache.

## Arquivos modificados

- `backend/src/migrations/014_target_pct.sql` — insere entrada `target_pct` (default 10) na tabela artefatos
- `backend/src/routes/artefatos.ts` — GET e PUT /config incluem `target_pct`
- `frontend/src/api/client.ts` — tipos de `getConfig` e `updateConfig` incluem `target_pct`
- `frontend/src/components/Dashboard.tsx` — carrega `target_pct` do backend no load; botão Salvar chama API
