# Skill: UI Fix — Idle Tracker

Você é um especialista em UI/UX para o projeto **Idle Tracker**. Sua tarefa é avaliar e resolver o problema visual descrito pelo usuário, sempre respeitando todas as restrições e convenções do projeto.

## Problema relatado pelo usuário

$ARGUMENTS

---

## Protocolo obrigatório antes de qualquer alteração

### 1. Leia o contexto completo do projeto

Antes de qualquer análise ou alteração, você **deve** ler os seguintes arquivos para entender o estado atual do projeto:

**Estrutura e regras:**
- `/home/alosano/repos/app_idle/CLAUDE.md` — regras obrigatórias, stack, rotas, lógica de negócio

**Componentes frontend (leia todos):**
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/components/ContinentPanel.tsx`
- `frontend/src/components/DetalheContinentePanel.tsx`
- `frontend/src/components/MinesTable.tsx`
- `frontend/src/components/SummaryPanel.tsx`
- `frontend/src/components/ArtefatosPanel.tsx`
- `frontend/src/components/BoosterBar.tsx`
- `frontend/src/components/ProducaoPanel.tsx`
- `frontend/src/components/PromocaoPanel.tsx`
- `frontend/src/components/CadastrosPanel.tsx`
- `frontend/src/components/UpgradeArrow.tsx`
- `frontend/src/components/LanguageSelector.tsx`
- `frontend/src/components/MetasPanel.tsx`

**Estilos e tipos:**
- `frontend/src/index.css` — todos os estilos globais
- `frontend/src/types/index.ts` — todos os tipos TypeScript
- `frontend/src/App.tsx`

**Utilitários:**
- `frontend/src/utils/upgradeAdvisor.ts`
- `frontend/src/utils/gameCalc.ts` (se existir)

**Internacionalização:**
- `frontend/src/locales/pt.json`
- `frontend/src/locales/en.json`

**Docs de alterações anteriores** — liste os últimos 10 arquivos em `docs/` para entender o histórico de mudanças:
```bash
ls -t /home/alosano/repos/app_idle/docs/ | head -10
```

### 2. Regras de UI deste projeto (NÃO viole)

- **Sem framework CSS** — apenas CSS puro em `index.css` e estilos inline quando necessário
- **Sem glow/animação em destaques** — apenas cor é suficiente (feedback salvo em memória)
- **React + TypeScript** — sem JavaScript puro nos componentes
- **Sem texto hardcoded** — sempre usar `t('chave')` do react-i18next; adicionar chave nos arquivos de locales se não existir
- **Sem comentários desnecessários** no código — apenas quando o "porquê" não é óbvio
- **Não introduzir novas dependências** sem aprovação do usuário
- **Não refatorar código não relacionado** ao problema — foco cirúrgico na correção

### 3. Verifique o número da próxima alteração

```bash
ls /home/alosano/repos/app_idle/docs/ | grep "alteracao_" | sort | tail -1
```

O próximo número está em CLAUDE.md (campo "Próximo número"). Use esse número para criar a documentação.

---

## Fluxo de trabalho

1. **Leia** todos os arquivos listados acima
2. **Analise** o problema relatado: identifique os componentes afetados, os arquivos de estilo relevantes, e o comportamento atual vs esperado
3. **Planeje** a solução mínima necessária — não altere nada além do que o problema exige
4. **Implemente** as alterações nos arquivos corretos
5. **Atualize os locales** se houver novos textos (pt.json, en.json e demais idiomas)
6. **Documente** a alteração em `/docs/alteracao_XXXX.md` com o formato:
   ```
   # Alteração XXXX — <título descritivo>
   **Data:** YYYY-MM-DD
   **Tipo:** feat | fix | refactor | chore
   ## O que foi alterado
   ## Motivação
   ## Arquivos modificados
   ```
7. **Atualize** o campo "Próximo número" no `CLAUDE.md`
8. **Rebuild** apenas o serviço afetado (geralmente frontend):
   ```bash
   docker compose -p app_idle_dev up --build -d frontend
   ```
9. **Aguarde** o container ficar saudável e informe o usuário

---

## Critérios de qualidade

- A solução resolve o problema descrito sem introduzir regressões
- O estilo é consistente com o padrão visual existente no `index.css`
- Nenhum texto está hardcoded — tudo via i18n
- TypeScript sem erros
- O código é legível e segue o padrão dos componentes existentes
