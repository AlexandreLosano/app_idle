# Alteração 0032 — Responsividade da tela de Ilhas

**Data:** 2026-05-19
**Tipo:** feat

## O que foi alterado

Adicionadas media queries para tornar a tela de Ilhas utilizável em telas menores (celular/tablet). Também foram adicionadas melhorias gerais de responsividade ao header e às tabs.

### Comportamento por tamanho de tela

| Breakpoint | Layout das Ilhas |
|---|---|
| ≥ 900px | Grid 5 colunas (comportamento original) |
| 700–899px | Grid 5 colunas com colunas ligeiramente menores e padding reduzido |
| < 700px | Modo card: nome da ilha em destaque, stats em linhas label : valor |

### Modo card (< 700px)
- Cabeçalho da tabela ocultado
- Cada stat (Produção/s, Próx. Prestígio, Tempo, Balanço) aparece em linha própria com label à esquerda e valor à direita
- Labels gerados via CSS `::before` + `attr(data-label)` — zero JS adicional
- Bullet de extração e badge de minas preservados

### Outras melhorias
- Tabs: `flex-wrap: wrap` para não transbordar em telas estreitas
- Panel-header: `flex-wrap: wrap` para o BoosterBar ir para segunda linha se necessário
- Header (< 500px): título menor e seletor de bandeiras mais compacto

## Motivação

O layout de grid fixo transbordava horizontalmente em telas menores, tornando a tela ilegível no celular.

## Arquivos modificados

- `frontend/src/index.css` — media queries `@media (max-width: 699px)` e `@media (min-width: 700px) and (max-width: 899px)`, mais ajustes globais de `.tabs` e `.panel-header`
- `frontend/src/components/IslandPanel.tsx` — adicionado `data-label={t('...')}` nos 4 elementos `.isl-col-val` para os labels mobile serem traduzíveis
