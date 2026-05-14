# Alteração 0006 — Correção do tipo NUMERIC retornado pelo node-postgres na rota /config de artefatos

**Data:** 2026-05-13
**Tipo:** fix

## O que foi alterado

Na rota `GET /artefatos/config` e `PUT /artefatos/config` (`backend/src/routes/artefatos.ts`), o campo `valor` da tabela `artefatos` (tipo `NUMERIC` no PostgreSQL) estava sendo retornado como string pelo node-postgres. Isso causava concatenação de string ao invés de adição numérica no frontend ao calcular o `boosterTotal`.

Adicionado `parseFloat(r.valor)` ao montar o objeto de resposta, garantindo que os valores retornados sejam números JavaScript.

## Motivação

O cálculo de produção por mina usa `(somaOff + total_comprado) * buster_anuncio`. Com `total_comprado` como string `"4"`, a expressão `somaOff + "4"` resultava em concatenação (`"164"`) em vez de soma (`20`), gerando `boosterTotal` incorreto (~483 vs 59).

## Arquivos modificados

- `backend/src/routes/artefatos.ts`
