# Alteração 0043 — Regras de deploy DEV/PRD no CLAUDE.md

**Data:** 2026-05-21
**Tipo:** chore

## O que foi alterado
- Adicionada **Regra 5** ao `CLAUDE.md`: após qualquer alteração de código, reconstruir e subir o ambiente DEV imediatamente (`docker compose up --build -d`), sem aguardar confirmação.
- Adicionada **Regra 6** ao `CLAUDE.md`: nunca fazer merge em `main` nem disparar o workflow de PRD sem aprovação explícita do usuário. O fluxo correto é desenvolver em `develop`, informar que o DEV foi atualizado e aguardar aprovação antes de subir para PRD via GitHub Actions.
- Corrigido o próximo número sequencial de alterações de `0041` para `0043`.

## Motivação
Garantir que toda alteração seja imediatamente testável no DEV e que o ambiente de PRD só seja atualizado com aprovação explícita do usuário, utilizando o workflow do GitHub Actions já configurado em `.github/workflows/deploy.yml`.

## Arquivos modificados
- `CLAUDE.md`
