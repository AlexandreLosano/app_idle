# Alteração 0031 — Suporte a múltiplos idiomas (i18n)

**Data:** 2026-05-19
**Tipo:** feat

## O que foi alterado

Implementação completa de internacionalização com suporte a 7 idiomas: Português (padrão), Inglês, Alemão, Francês, Espanhol, Italiano e Holandês.

- Novo componente `LanguageSelector` no header com botões de bandeira emoji (🇧🇷 🇬🇧 🇩🇪 🇫🇷 🇪🇸 🇮🇹 🇳🇱)
- Idioma selecionado persiste em `localStorage`
- Todos os textos de UI substituídos por chamadas `t('chave')` — zero hardcode nos componentes
- Nomes dos continentes incluídos nos locales (baseados em fontes oficiais e `traducoes.md`)

## Motivação

Permitir que jogadores de diferentes países usem o tracker na sua língua nativa, alinhado com os idiomas suportados pelo próprio Idle Miner Tycoon.

## Arquivos modificados

**Novos:**
- `frontend/package.json` — adicionadas dependências `i18next ^23.0.0` e `react-i18next ^14.0.0`
- `frontend/src/i18n.ts` — inicialização do i18next com os 7 locales
- `frontend/src/locales/pt.json` — Português (idioma padrão)
- `frontend/src/locales/en.json` — English
- `frontend/src/locales/de.json` — Deutsch
- `frontend/src/locales/fr.json` — Français
- `frontend/src/locales/es.json` — Español
- `frontend/src/locales/it.json` — Italiano
- `frontend/src/locales/nl.json` — Nederlands
- `frontend/src/components/LanguageSelector.tsx` — seletor de bandeiras

**Alterados:**
- `frontend/src/main.tsx` — `import './i18n'` antes do render
- `frontend/src/index.css` — estilos `.lang-selector` e `.lang-btn`; `.header-controls` para alinhar controles do header
- `frontend/src/components/Dashboard.tsx` — `useTranslation`, integração do `LanguageSelector`, todas as strings
- `frontend/src/components/IslandPanel.tsx` — `useTranslation`, `formatTime` parametrizado com labels traduzíveis
- `frontend/src/components/MinesTable.tsx` — `useTranslation`, cabeçalhos e tooltips
- `frontend/src/components/SummaryPanel.tsx` — `useTranslation`, `DonutChart` recebe `prestiges` como prop
- `frontend/src/components/ArtefatosPanel.tsx` — `useTranslation`, labels e botões
- `frontend/src/components/BoosterBar.tsx` — `useTranslation`, labels do breakdown
- `frontend/src/components/CadastrosPanel.tsx` — `useTranslation`, placeholders e títulos
- `frontend/src/components/ProducaoPanel.tsx` — `useTranslation`, colunas dinâmicas via `t()`
- `frontend/src/components/PromocaoPanel.tsx` — `useTranslation`, labels e unidades de tempo
