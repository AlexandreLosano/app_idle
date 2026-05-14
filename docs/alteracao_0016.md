# Alteração 0016 — Minas tab somente leitura + % por ilha

**Data:** 2026-05-13
**Tipo:** feat

## O que foi alterado

- `MinesTable` agora aceita prop `readOnly?: boolean`. Quando ativo, todos os campos de edição (inputs de nível, selects de letra, inputs de prestígio) são substituídos por `<span>` somente leitura e a coluna de ação (botão Salvar) é ocultada.
- Cálculo do percentual `%` corrigido: agora é calculado por ilha (`island_id`) em vez de sobre o total global de minas visíveis. Cada mina mostra quanto representa dentro da sua própria ilha.
- `Dashboard` passa `readOnly={true}` para o `MinesTable` da aba Minas.
- CSS adicionado para centralizar e formatar os `<span>` de leitura nas células de nível/letra/prestígio.

## Motivação

A aba Minas deve ser apenas visualização — edição de dados ocorre na aba Ilhas. Além disso, o percentual por total global não fazia sentido analítico; o correto é o percentual de contribuição de cada mina dentro da sua ilha.

## Arquivos modificados

- `frontend/src/components/MinesTable.tsx`
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/index.css`
