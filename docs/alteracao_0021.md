# Alteração 0021 — Melhorias visuais na tabela de minas

**Data:** 2026-05-14
**Tipo:** feat

## O que foi alterado

### Encapsulamento visual de grupos de colunas
Dois grupos de colunas na `MinesTable` receberam fundo diferenciado via `<colgroup>`:

- **Grupo A** (Armazém, Elevador, Extração, Prest. Atual, Prest. Máx.) — fundo levemente mais claro (`rgba(255,255,255,0.03)`), sem bordas verticais.
- **Grupo B** (Próx. Prestígio: Valor + Letra) — fundo azul accent suave (`rgba(108,142,247,0.09)`), sem bordas ou linhas de nenhum tipo.

Implementado com `<colgroup><col />` para evitar adicionar classes em cada célula individualmente.

### Botão Salvar com estado dirty
O botão Salvar na tabela editável ganhou 4 estados visuais:

| Estado | Visual |
|--------|--------|
| Sem alterações | Cinza, desabilitado |
| Com edições não salvas | Amarelo (`--warn`), ativo |
| Salvando | "…", desabilitado |
| Salvo (sem novas edições) | Verde (`--ok`) "✓", desabilitado |

Implementado via estado `dirty: Record<number, boolean>` — marcado como `true` em qualquer edição e resetado para `false` após save bem-sucedido.

### Coluna "Ordem Prestígio" com bullet de validação
Nova coluna antes de Produção mostrando a ordem sugerida para realizar prestígios (menor `proximo_prestigio` = #1). Bullet colorido compara esse rank com o rank de % de produção:

| Bullet | Diferença de ranks | Significado |
|--------|--------------------|-------------|
| 🟢 Verde | 0 | Alinhado |
| 🟡 Amarelo | 1 posição | Leve desalinho |
| 🔴 Vermelho | 2+ posições | Fora de ordem |

### Indicador de balanço no header da ilha
Após o campo Tempo no header de cada ilha: bullet + texto "Equilibrado" (verde) ou "Trabalhar" (amarelo/vermelho) resumindo o pior bullet das minas da ilha.

### BoosterBar
Componente `BoosterBar` exibe no topo das páginas Resumo e Ilhas: artefatos ativos, soma offline, comprados, multiplicador de anúncio e total do booster.

## Arquivos modificados

- `frontend/src/components/MinesTable.tsx`
- `frontend/src/components/IslandPanel.tsx`
- `frontend/src/components/SummaryPanel.tsx`
- `frontend/src/components/BoosterBar.tsx` (novo)
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/index.css`
