# Alteração 0011 — Seed das minas de Aurora, Crepúsculo, Antigo, Misterio e Oceano

**Data:** 2026-05-13
**Tipo:** chore

## O que foi alterado

Criada migração `009_seed_aurora_onward.sql` com 24 UPDATE statements populando as colunas de Armazém, Elevador, Extração, Prestígio Atual, Prestígio Máximo e Próximo Prestígio para todas as minas das ilhas ainda sem dados, extraídos diretamente da planilha `Idle_v2.1.xlsx` (aba Idle-Normal).

## Motivação

Dados inseridos manualmente pelo usuário até a ilha Fogo. As ilhas restantes foram populadas via migração para agilizar.

## Arquivos modificados

- `backend/src/migrations/009_seed_aurora_onward.sql`
