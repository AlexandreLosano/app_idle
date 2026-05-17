# Alteração 0026 — Tela de Simulação de Promoção

**Data:** 2026-05-17
**Tipo:** feat

## O que foi alterado

Nova aba "Promoção" no Dashboard com calculadora para simular a compra de pacotes de artefatos promocionais.

O usuário informa:
- Quantidade de artefatos do pacote (ex: 1000, 5000)
- Duração da promoção + unidade (minutos / horas / dias)

A tela exibe, para cada ilha do continente ativo:
- Produção atual → produção com a promoção
- Badge indicando quantas minas vão atingir o próximo prestígio dentro do prazo
- Tabela expansível por mina: próx. prestígio, tempo atual, tempo com promo, status (✓ / ✗ / ★)

## Motivação

Permitir avaliar rapidamente se uma promoção paga vale a pena com base nos dados reais do tracker, sem necessidade de salvar nada no banco.

## Lógica de cálculo

Os artefatos da promoção são **somados** ao `somaOff` existente (mesma fórmula atual):

```
promoBoosterTotal = (somaOff + promoQtd + totalComprado) × busterAnuncio × 10
```

Tempo por mina = `nextPrestige.raw / promoProduction.raw` (segundos)
Vai atingir = tempo ≤ duração da promoção em segundos

## Arquivos modificados

- `frontend/src/components/PromocaoPanel.tsx` — novo componente
- `frontend/src/components/Dashboard.tsx` — nova aba + import
- `frontend/src/index.css` — estilos da tela de promoção
