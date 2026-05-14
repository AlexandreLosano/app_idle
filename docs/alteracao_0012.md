# Alteração 0012 — Artefatos, Boosters e coluna Produção por mina

**Data:** 2026-05-13
**Tipo:** feat

## O que foi alterado

### Tab Boosters / Artefatos (`ArtefatosPanel.tsx`)
- Tabela de artefatos com toggle de ativo/inativo por clique
- Campos editáveis **Buster Anuncio** e **Total Comprado** salvos via `PUT /api/artefatos/config`
- Exibe **Soma Off** (soma automática dos artefatos ativos) e **Total** = `(SomaOff + TotalComprado) × BusterAnuncio` arredondado 1 casa decimal
- Buster Anuncio e Total Comprado armazenados na própria tabela `artefatos` com coluna `valor NUMERIC` e `tipo` in `('buster_anuncio', 'total_comprado')`

### Migração `008_config_em_artefatos.sql`
- Adicionada coluna `valor NUMERIC` em `artefatos`
- `quantidade` tornou-se nullable
- Dados de `boosters_config` migrados para linhas em `artefatos`

### Rota `/api/artefatos/config`
- `GET` e `PUT` antes/depois de `/:id` para evitar conflito de rota Express
- Resposta retorna `{ buster_anuncio, total_comprado }` como números (não strings — ver alteração 0006)

### Coluna Produção na MinesTable
- Função `boostedDisplay(nivel, letra, booster, factors)`: multiplica diretamente `nivel × booster` (sem log/exp) e normaliza a letra dividindo por 1000 até resultado < 1000 — elimina erros de ponto flutuante que divergiam do Excel
- Função `roundByMagnitude(n)`: arredonda com 2 casas se n < 10, 1 casa se n < 100, 0 casas se n ≥ 100 — corresponde ao `ROUND(P, IF(P<10,2,IF(P<100,1,0)))` do Excel
- `boosterTotal` calculado no `Dashboard.tsx` como `ROUND((somaOff + totalComprado) × busterAnuncio, 1)` e passado como prop
- Fator de multiplicação na tabela = `boosterTotal / 10`

## Arquivos modificados

- `backend/src/migrations/005_artefatos.sql`
- `backend/src/migrations/006_boosters_config.sql`
- `backend/src/migrations/007_total_comprado.sql`
- `backend/src/migrations/008_config_em_artefatos.sql`
- `backend/src/routes/artefatos.ts`
- `frontend/src/types/index.ts` — interface `Artefato`
- `frontend/src/api/client.ts` — `api.artefatos.*`
- `frontend/src/components/ArtefatosPanel.tsx` — novo componente
- `frontend/src/components/MinesTable.tsx` — funções `boostedDisplay`, `roundByMagnitude`, coluna Produção
- `frontend/src/components/Dashboard.tsx` — cálculo de `boosterTotal`, fetch de config
- `frontend/src/index.css` — estilos de artefatos e coluna produção
