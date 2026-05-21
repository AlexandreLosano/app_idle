# Alteração 0042 — Remoção do Jenkinsfile

**Data:** 2026-05-21
**Tipo:** chore

## O que foi alterado
- Removido `Jenkinsfile.disabled` da raiz do projeto.

## Motivação
O Jenkins foi desligado e o pipeline de CI/CD migrado para GitHub Actions (`.github/workflows/deploy.yml`). O arquivo estava desativado (`.disabled`) e não era mais utilizado; mantê-lo apenas gerava ruído.

## Arquivos modificados
- `Jenkinsfile.disabled` — removido
