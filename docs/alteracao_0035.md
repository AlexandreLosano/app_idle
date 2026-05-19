# Alteração 0035 — Colunas NÍVEIS na tela Detalhe Ilha

**Data:** 2026-05-19
**Tipo:** feat

## O que foi alterado

Adicionadas as colunas A (Armazém), E (Elevador) e 25–35 à tabela de resultados do painel Detalhe Ilha, agrupadas sob um cabeçalho geral **NÍVEIS** com colspan.

### Estrutura do cabeçalho (2 linhas)
```
| Mina        |            NÍVEIS (colspan=13)             | Produção atual | Ordem Prestígio |
|             | Armazém | Elevador | 25 | 26 | … | 35      |                |                 |
```

### Dados exibidos
- **Armazém / Elevador**: leitura direta do banco (`armazem_nivel + armazem_letra`, `elevador_nivel + elevador_letra`) — somente exibição.
- **25–35**: inputs de texto locais (estado React por mina × coluna), sem persistência — para uso como calculadora.

### Estilo visual
- Cabeçalho NÍVEIS com fundo levemente colorido e bordas laterais na cor accent para delimitar o grupo.
- Sub-cabeçalhos com separadores internos.
- Wrapper com `overflow-x: auto` para scroll horizontal quando necessário.
- Inputs compactos (58px) com estilo monoespaçado.

## Motivação

O usuário pediu para reintroduzir as colunas de níveis (mantidas de versão anterior) agora que a tela tem mais espaço com o layout de filtros, e adicionar um título de grupo NÍVEIS para organizar visualmente.

## Arquivos modificados

- `frontend/src/components/DetalheIlhaPanel.tsx` — adicionadas colunas, rowspan/colspan no thead, inputs locais para 25–35
- `frontend/src/index.css` — novos estilos: `.detalhe-niveis-header`, `.detalhe-sub-th`, `.detalhe-col-input`, `.detalhe-input-td`, `.detalhe-th-rowspan`
