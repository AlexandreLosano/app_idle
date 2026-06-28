# Alteração 0049 — Fix: sequência mines_id_seq dessincronizada

**Data:** 2026-06-28
**Tipo:** fix

## O que foi alterado
Criada migração `021_fix_mines_id_seq.sql` que redefine a sequência `mines_id_seq` para o valor máximo atual de `id` na tabela `mines`.

## Motivação
A sequência primária da tabela `mines` estava em 4 enquanto o `MAX(id)` era 44, causando `duplicate key value violates unique constraint "mines_pkey"` em todo `POST /api/mines` (criação de novas minas retornava 500).

## Arquivos modificados
- `backend/src/migrations/021_fix_mines_id_seq.sql` (novo)
