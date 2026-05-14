# Alteração 0015 — Coluna % de produção e ajuste nos headers de prestígio

**Data:** 2026-05-13
**Tipo:** feat

## O que foi alterado

### Headers de Prestígio
- "Prest. Atual" e "Prest. Máx." receberam `<br />` para quebrar em duas linhas
- Largura reduzida de 78 px para 56 px (`col-prestige`)

### Coluna `%` de Produção
- Nova função `rawBottleneck(f, factors)`: retorna o valor absoluto do gargalo de cada mina em unidades base (`nivel × 1000^(cont-1)`) sem aplicar booster — o booster cancela no ratio
- Antes do render, calcula `rawMap` (valor por mina) e `totalRaw` (soma da ilha/filtro)
- Cada linha exibe `(rawMap[m.id] / totalRaw × 100).toFixed(2) + '%'`
- Coluna posicionada após Produção; estilizada com fonte monospace bold, cor branca, largura 58 px

### Motivação
Permite identificar visualmente quais minas mais contribuem para a produção total e onde vale a pena investir upgrades.

## Arquivos modificados

- `frontend/src/components/MinesTable.tsx`
- `frontend/src/index.css`
