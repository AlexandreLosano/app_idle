# Alteração 0031 — Persistência de horas_sono no banco + botão Salvar unificado

**Data:** 2026-05-18
**Tipo:** feat

## O que foi alterado

O campo "Horas de sono" da tela Produção passou a ser salvo no banco de dados via tabela `artefatos`. O botão Salvar foi unificado para gravar simultaneamente o multiplicador offline e as horas de sono.

## Motivação

O valor era salvo apenas em localStorage. Com a unificação do botão, a UX fica mais simples.

## Arquivos modificados

- `backend/src/migrations/016_horas_sono.sql` — insere entrada `horas_sono` (default 8) na tabela artefatos
- `backend/src/routes/artefatos.ts` — GET e PUT /config incluem `horas_sono`
- `frontend/src/api/client.ts` — tipos de `getConfig` e `updateConfig` incluem `horas_sono`
- `frontend/src/components/Dashboard.tsx` — `boosterCfg` inclui `horas_sono`; passa `horasSonoInit` para ProducaoPanel
- `frontend/src/components/ProducaoPanel.tsx` — inicializa a partir da prop; botão Salvar unificado grava `mult_off` e `horas_sono` em uma chamada; remove localStorage
