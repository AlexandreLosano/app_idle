# Alteração 0004 — Migration runner idempotente

**Data:** 2026-05-13
**Tipo:** fix

## O que foi alterado

Corrigido bug onde todas as migrações rodavam a cada restart do backend,
causando erro 500 em `/mines` porque a migração 002 tentava TRUNCATE na
tabela `prestige` já removida pela 003.

## Solução

Criada tabela `_migrations` no banco para rastrear quais arquivos já foram
aplicados. Cada migração agora roda exatamente uma vez.

## Arquivos modificados

- `backend/src/db.ts` — runMigrations com tracking via `_migrations`
