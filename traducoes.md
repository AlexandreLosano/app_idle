# Idle Miner Tycoon — Nomes dos Continentes por Idioma

> Referência para implementação de i18n no app_idle.
> Última atualização: 2026-05-19

## Legenda

| Símbolo | Significado |
|---------|-------------|
| _(sem marcação)_ | Confirmado em fonte oficial (Help Center localizado, App Store, changelogs) |
| ² | Mencionado por jogador italiano na App Store |
| ³ | **Tradução livre — confirmar com a comunidade no Reddit** |
| ⁴ | Espanhol mantém o nome em inglês nos changelogs oficiais |

---

## Tabela de Continentes

| Continente | 🇧🇷 PT | 🇬🇧 EN | 🇩🇪 DE | 🇫🇷 FR | 🇪🇸 ES | 🇮🇹 IT | 🇳🇱 NL |
|---|---|---|---|---|---|---|---|
| Grass | Principal | Grass Continent | Gras Kontinent | Continent Herbe ³ | Continente de Hierba | Continente di Partenza ² | Gras Continent ³ |
| Ice | Gelo | Ice Continent | Eis Kontinent | Continent Glace | Continente de Hielo | Continente di Ghiaccio | IJs Continent ³ |
| Fire | Fogo | Fire Continent | Feuer Kontinent | Continent Feu | Continente de Fuego | Continente di Fuoco | Vuur Continent ³ |
| Dawn | Aurora | Dawn Continent | Morgenrot Kontinent | Continent Aube ³ | Continente Dawn ⁴ | Continente Alba ³ | Dageraad Continent ³ |
| Dusk | Crepúsculo | Dusk Continent | Abendrot Kontinent | Continent Crépuscule ³ | Continente Crepúsculo ³ | Continente Crepuscolo ³ | Schemering Continent ³ |
| Ancient | Antigo | Ancient Continent | Antiker Kontinent | Continent Antique ³ | Continente Antiguo ³ | Continente Antico ³ | Antiek Continent ³ |
| Lost Desert | Deserto Perdido | Lost Desert Continent | Verlorene Wüste ³ | Continent Désert Perdu ³ | Continente Desierto Perdido ³ | Continente Deserto Perduto ³ | Verloren Woestijn ³ |
| Underwater | Oceano | Underwater Continent | Unterwasser Kontinent ³ | Continent Sous-Marin ³ | Continente Submarino ³ | Continente Sottomarino ³ | Onderwater Continent ³ |

---

## Prioridade de Confirmação no Reddit

Os continentes abaixo têm maior necessidade de validação, pois são end-game e têm pouca documentação localizada fora do inglês:

1. **Underwater** — menos jogadores chegaram, quase nada documentado em outras línguas
2. **Lost Desert** — também avançado, sem fontes localizadas encontradas
3. **Dusk / Ancient** — confirmações parciais
4. **Holandês (NL)** — nenhuma fonte oficial encontrada em nenhum continente

### Sugestão de texto para o post no Reddit

> "Building a tracker app for IMT and need help with official in-game continent names in different languages.
> Most helpful would be the names for the **later continents** (Dusk, Ancient, Lost Desert, Underwater) since those are harder to find documented anywhere.
> If you play in DE, FR, ES, IT or NL — any continent name helps!
> Thanks in advance 🙏"

---

## Notas para implementação (i18n)

- Chave de referência: nome em inglês sem espaços, em snake_case (ex: `grass_continent`, `lost_desert_continent`)
- Arquivo de localização: `frontend/src/locales/{lang}.json`
- Estrutura sugerida:

```json
{
  "continents": {
    "grass": "Grass Continent",
    "ice": "Ice Continent",
    "fire": "Fire Continent",
    "dawn": "Dawn Continent",
    "dusk": "Dusk Continent",
    "ancient": "Ancient Continent",
    "lost_desert": "Lost Desert Continent",
    "underwater": "Underwater Continent"
  }
}
```