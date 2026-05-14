# Alteração 0020 — Ranking de ordem de prestígio + bullet de validação

**Data:** 2026-05-14
**Tipo:** feat
**Status:** ⚠️ Lógica preliminar — sujeita a revisão futura

## O que foi alterado

### Coluna "Ordem Prestígio" (MinesTable)
Nova coluna adicionada antes de Produção na tabela de minas (abas Ilhas e Minas).

**Critério de ranking atual:** menor valor de `proximo_prestigio` (score = letra + nível) = rank #1, ou seja, a mina que precisa de menos produção acumulada para prestigiar é a primeira a ser feita.

### Bullet de validação (MinesTable)
Ao lado do número de rank, um bullet colorido compara o rank de prestígio com o rank de produção (% da ilha):

| Cor | Diferença entre ranks | Significado |
|-----|-----------------------|-------------|
| 🟢 Verde | 0 | Rank de prestígio = rank de produção (alinhado) |
| 🟡 Amarelo | 1 posição | Levemente fora de ordem |
| 🔴 Vermelho | 2+ posições | Fora de ordem |

**Premissa atual:** mina com menor % de produção deveria ser prestigiada primeiro (#1), e a mina com maior % por último.

### Indicador de balanço no header da ilha (IslandPanel)
Após o campo Tempo, exibe o pior bullet do grupo:
- 🟢 **Equilibrado** — todas as minas alinhadas
- 🟡/🔴 **Trabalhar** — pelo menos uma mina fora de ordem

## ⚠️ Nota importante

A lógica de ordenação e validação foi implementada com base no entendimento atual do jogo. Em determinadas circunstâncias ainda não conhecidas, a lógica pode precisar de ajuste. **Aguardar validação em jogo antes de considerar estável.**

## Arquivos modificados

- `frontend/src/components/MinesTable.tsx`
- `frontend/src/components/IslandPanel.tsx`
- `frontend/src/index.css`
