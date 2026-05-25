# Alteração 0046 — Fator de Rendimento para Continente com Prestígio Máximo

**Data:** 2026-05-25
**Tipo:** feat

## O que foi alterado

Quando todas as minas de um continente atingem o prestígio máximo (`prestigio_atual === prestigio_maximo` para todas as minas), a tabela de minas passa a exibir uma nova coluna **Fator de Rendimento** no lugar das colunas de **Próximo Prestígio** (valor + letra).

- O Fator de Rendimento é um número puro (sem letra de magnitude), editável por mina diretamente na tabela.
- A distribuição das metas (setas de upgrade ↑/↑↑/↑↑↑ e coluna Target) passa a ser proporcional ao fator de cada mina em relação à soma dos fatores do continente: `targetRaw = metaRaw × (fator_mina / Σfatores)`.
- A coluna % de produção não é alterada — continua refletindo o gargalo real de cada mina.

## Motivação

Com o prestígio máximo atingido, o conceito de "próximo prestígio" perde sentido. O Fator de Rendimento permite ao usuário definir como a produção deve ser distribuída entre as minas de forma intencional, substituindo a lógica de ranking por prestígio.

## Arquivos modificados

- `backend/src/migrations/020_fator_rendimento.sql` — nova coluna `fator_rendimento NUMERIC` na tabela `mines`
- `backend/src/routes/mines.ts` — PUT aceita e persiste `fator_rendimento`
- `frontend/src/types/index.ts` — campo `fator_rendimento: number | null` adicionado à interface `Mine`
- `frontend/src/utils/upgradeAdvisor.ts` — nova função `computeUpgradeHintsMaxed()` para distribuição por fator
- `frontend/src/components/MinesTable.tsx` — coluna condicional (Próx. Prestígio ↔ Fator de Rendimento) + save
- `frontend/src/components/ContinentPanel.tsx` — detecta `isMaxed`, repassa prop e chama a função de hints correta
- `frontend/src/locales/*.json` — chave `mines.col_fator_rendimento` adicionada em todos os 7 idiomas
