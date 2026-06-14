# Alteração 0048 — Redução adaptativa de fonte na coluna Mina (MinesTable)
**Data:** 2026-06-14
**Tipo:** fix

## O que foi alterado
- `MinesTable.tsx`: adicionada função `mineNameStyle` que retorna `fontSize: '11px'` para nomes com 14–17 chars e `fontSize: '10px'` para nomes com 18+ chars; o conteúdo da célula `col-nome` foi encapsulado em `<div class="mine-name-cell">` para contenção via flexbox; adicionado atributo `title` no span para exibir o nome completo via tooltip.
- `index.css`: largura de `col-nome` aumentada de 100px para 130px com `max-width: 130px` e `overflow: hidden`; adicionada classe `.mine-name-cell` (flex, overflow hidden); `.mine-name` recebeu `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`, `min-width: 0` e `flex: 1`; breakpoint 699px atualizado de `width: 80px` para `width: 90px; max-width: 90px`.

## Motivação
No modo de jogo Elemental, os nomes das minas ("Diamente da Natureza", "Carvão da Natureza", etc., 16–21 chars) expandiam a coluna Mina além do espaço disponível, sobrepondo as colunas de valores numéricas. A fonte adaptativa reduz o tamanho do texto conforme o nome cresce, mantendo a legibilidade; o ellipsis serve de contenção final para nomes extremamente longos.

## Arquivos modificados
- `frontend/src/components/MinesTable.tsx`
- `frontend/src/index.css`
