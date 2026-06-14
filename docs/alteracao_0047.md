# Alteração 0047 — Skill /ui para resolução de problemas visuais

**Data:** 2026-06-14
**Tipo:** chore

## O que foi alterado

- Criado `.claude/commands/ui.md` — skill personalizada para o Claude Code que, ao ser invocada com `/ui <descrição>`, lê todo o projeto e resolve problemas de UI seguindo as convenções do projeto
- Atualizado `CLAUDE.md` com documentação da skill e correção do próximo número de alteração (era 0044, atualizado para 0048)

## Motivação

Criar um atalho padronizado para resolução de problemas visuais, garantindo que o Claude sempre leia todos os componentes, estilos e restrições do projeto antes de fazer qualquer alteração de UI.

## Arquivos modificados

- `.claude/commands/ui.md` (novo)
- `CLAUDE.md` (documentação da skill + correção do contador)
