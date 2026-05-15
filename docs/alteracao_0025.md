# Alteração 0025 — Setas de sugestão de upgrade por mina
**Data:** 2026-05-15
**Tipo:** feat

## O que foi alterado
- Adicionado `frontend/src/utils/upgradeAdvisor.ts` com lógica pura de cálculo dos hints de upgrade
- Adicionado `frontend/src/components/UpgradeArrow.tsx` com o indicador visual (↑/✓/→)
- Adicionadas classes CSS `.upgrade-arrow`, `.upgrade-arrow.up`, `.upgrade-arrow.ok`, `.upgrade-arrow.skip` em `frontend/src/index.css`
- `frontend/src/components/MinesTable.tsx` recebe prop opcional `upgradeHints` e exibe o `UpgradeArrow` à esquerda do nome de cada mina na coluna MINA
- `frontend/src/components/IslandPanel.tsx` computa os hints por ilha via `computeUpgradeHints` e os passa para `MinesTable`

## Motivação
Facilitar a decisão de qual mina focar nos upgrades, exibindo indicadores visuais baseados na relação entre a produção atual (bottleneck) e um target proporcional ao custo do próximo prestígio da ilha.

## Algoritmo
1. Identifica a mina com menor custo de próximo prestígio (rank #1)
2. `base = custo_rank1_raw / 86400`
3. Ordena minas ativas (`prest_atual < prest_max`) por custo de prestígio crescente
4. Aplica percentuais `[1%, 5%, 20%, 25%, 50%]` (escalados para n minas) para definir `target` de cada mina
5. Compara `bottleneck_raw` com `target`: `< 90%` → ↑ amarelo, `± 10%` → ✓ verde, `> 110%` → → cinza
6. Minas maxadas não recebem indicador

## Arquivos modificados
- `frontend/src/utils/upgradeAdvisor.ts` (novo)
- `frontend/src/components/UpgradeArrow.tsx` (novo)
- `frontend/src/index.css`
- `frontend/src/components/MinesTable.tsx`
- `frontend/src/components/IslandPanel.tsx`
