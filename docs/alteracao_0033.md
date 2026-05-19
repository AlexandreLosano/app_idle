# Alteração 0033 — Responsividade da tabela de Minas

**Data:** 2026-05-19
**Tipo:** feat

## O que foi alterado

Adicionadas melhorias de responsividade à tabela de minas exibida ao expandir uma ilha na tela de Ilhas.

### Cabeçalhos com quebra de linha
- Removido `white-space: nowrap` dos `<th>` da tabela de minas
- Adicionado `white-space: normal; word-break: break-word; line-height: 1.2` para permitir que textos longos (como "ENTREPÔT", "ASCENSEUR", "PROCHAIN PRESTIGE") quebrem em múltiplas linhas
- Dados nas células (`<td>`) mantêm `white-space: nowrap` para não quebrar valores numéricos

### Colunas fixas (sticky)
- Colunas de status (bullet) e nome da mina agora têm `position: sticky` com `background: var(--surface)` e `z-index: 2`
- Ao rolar horizontalmente, o status e o nome da mina permanecem visíveis
- Sombra sutil (`box-shadow`) na coluna de nome indica a separação da área rolável
- Fundo das células sticky atualiza corretamente no hover (`var(--surface2)`)

### Dimensões de colunas reduzidas
| Coluna | Antes | Depois |
|---|---|---|
| `col-nivel` | 86px | 72px |
| `col-letra` | 56px | 48px |
| `col-prestige` | 56px | 50px |
| `col-rank` | 72px | 60px |
| `col-producao` | 90px | 80px |
| `col-pct` | 58px | 50px |
| `col-target` | 72px | 64px |
| `col-action` | 68px | 60px |

### Media queries
- **≤ 1100px**: fonte 12px, padding reduzido, colunas ainda menores (ex. `col-nivel: 62px`)
- **≤ 699px**: fonte 11px, padding mínimo, colunas ainda mais compactas; botão Salvar com padding menor

### `border-collapse` alterado
- `border-collapse: collapse` → `border-collapse: separate; border-spacing: 0` para compatibilidade com `position: sticky` (requerimento dos navegadores)
- Visualmente idêntico pois todas as bordas internas da tabela já eram `border: none`

## Motivação

A tabela de minas tinha largura mínima de ~1180px e forçava scroll horizontal em qualquer tela menor. Com os cabeçalhos quebrando em linha e as colunas mais compactas, a tabela fica legível em telas de 900–1100px sem scroll. Em telas menores o scroll horizontal persiste mas o nome da mina fica sempre visível pelo sticky.

## Arquivos modificados

- `frontend/src/index.css` — regras `.mines-table` e media queries `@media (max-width: 1100px)` e `@media (max-width: 699px)`
