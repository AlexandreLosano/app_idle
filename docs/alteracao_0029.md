# Alteração 0029 — Persistência do Multiplicador Offline no banco

**Data:** 2026-05-18
**Tipo:** feat

## O que foi alterado

O multiplicador de anúncio offline (tela Produção) passou a ser salvo no banco de dados via tabela `artefatos`, usando o mesmo padrão das configs existentes. Foi adicionado botão "Salvar" ao lado do campo.

## Motivação

O valor era salvo apenas em localStorage, sendo perdido ao trocar de navegador ou limpar cache.

## Arquivos modificados

- `backend/src/migrations/015_mult_off.sql` — insere entrada `mult_off` (default 3) na tabela artefatos
- `backend/src/routes/artefatos.ts` — GET e PUT /config incluem `mult_off`
- `frontend/src/api/client.ts` — tipos de `getConfig` e `updateConfig` incluem `mult_off`
- `frontend/src/components/Dashboard.tsx` — `boosterCfg` inclui `mult_off`; passa `multOff` para ProducaoPanel
- `frontend/src/components/ProducaoPanel.tsx` — inicializa a partir da prop; botão Salvar chama API; remove localStorage
