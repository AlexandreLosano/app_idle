# Alteração 0052 — Cadastro/edição do próximo prestígio na tela Detalhe de Continente

**Data:** 2026-10-05
**Tipo:** feat

## O que foi alterado

1. Novo grupo de colunas **Próx. Prestígio** (Valor + Letra) na tabela principal da tela Detalhe de Continente, entre os níveis e a Produção atual.
2. O valor é salvo ao sair do campo (blur) ou ao pressionar Enter; a letra é salva assim que selecionada.
3. O salvamento usa a rota já existente `PUT /api/mines/:nome` e propaga a mina atualizada para o `Dashboard` (`onMineUpdate`), então a coluna Ordem Prestígio e as demais abas refletem a mudança na hora.

## Motivação

O próximo prestígio só podia ser informado na aba Continentes. Como a ordem de prestígio é consultada no Detalhe de Continente, era preciso trocar de aba para corrigir o valor.

## Observações

- Valor vazio, inválido ou ≤ 0 é descartado e o campo volta ao valor salvo. A rota usa `COALESCE`, portanto não é possível apagar um próximo prestígio já cadastrado (mesmo comportamento da aba Continentes).
- Sem alteração de backend nem de banco.

## Arquivos modificados

- `frontend/src/components/DetalheContinentePanel.tsx`
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/index.css`
- `CLAUDE.md`
