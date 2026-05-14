# Alteração 0013 — Backend PUT mines retorna island_nome via JOIN

**Data:** 2026-05-13
**Tipo:** fix

## O que foi alterado

O `PUT /api/mines/:nome` fazia `RETURNING *` diretamente na tabela `mines`, que não possui a coluna `island_nome`. Após salvar uma mina, o objeto retornado tinha `island_nome = undefined`, causando o desaparecimento do nome da ilha na UI até a próxima recarga completa.

**Solução:** após o UPDATE, executa um `SELECT m.*, i.nome AS island_nome FROM mines m LEFT JOIN islands i ON i.id = m.island_id WHERE m.id = $1` para retornar o registro completo com o JOIN.

## Motivação

A coluna Ilha na aba Minas exibe `m.island_nome` diretamente do estado do pai. Quando o `onUpdate(updated)` era chamado com um objeto sem `island_nome`, o estado ficava corrompido e a célula mostrava `—` até recarregar a página.

## Arquivos modificados

- `backend/src/routes/mines.ts`
