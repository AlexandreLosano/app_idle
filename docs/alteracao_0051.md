# Alteração 0051 — Fix: combos de letra ilegíveis e tabela de minas apertada na tela de Continentes

**Data:** 2026-08-18
**Tipo:** fix

## O que foi alterado

1. `color-scheme: dark;` em `:root` (melhoria geral, controles nativos do navegador em tema escuro).
2. Largura da coluna `.col-letra` na tabela de minas aumentada de 48px para 64px (desktop), 56px (≤1100px) e 50px (≤699px), com `min-width` travado em cada breakpoint.
3. Largura máxima do `.dashboard` aumentada de 1200px para 1600px, para aproveitar telas largas.
4. Largura da coluna `.col-nome` (nome da mina) aumentada de 130px para 160px.

## Causa raiz

- **Combos ilegíveis:** o sistema de notação tem letras de 1 caractere (`-`, `k`, `m`, `b`, `t`) e de 2 caracteres a partir de `cont` 6 (`aa`…`bz`). A coluna `.col-letra` (48px) só cabia 1 caractere confortavelmente; em saves avançados (ex.: letra `bd`), o texto de 2 caracteres era cortado nas bordas do `<select>` (`text-align:center`), sobrando um traço vertical parecendo "I".
- **Nome da mina espremido contra os dados:** com `.dashboard` travado em `max-width: 1200px`, mesmo em monitores largos (testado em 1904px), a tabela de minas não tinha espaço sobrando — nomes de ~12 caracteres (ex. "Água-Marinha") ocupavam quase toda a coluna de 130px, deixando o texto colado na caixa de nível do Armazém ao lado. Aumentar o `max-width` do dashboard libera espaço real de tela para as colunas, e a coluna do nome ficou mais folgada (160px).

## Arquivos modificados

- `frontend/src/index.css`
