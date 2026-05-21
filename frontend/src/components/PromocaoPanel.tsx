import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Mine, Continent, Factor, Artefato } from '../types';
import { computeProduction, minNextPrestige, formatTime } from '../utils/gameCalc';

interface Props {
  continents: Continent[];
  mines: Mine[];
  factors: Factor[];
  artefatos: Artefato[];
  boosterCfg: { buster_anuncio: number | null; total_comprado: number | null };
  boosterTotal: number;
}

interface ArtefatoEntry {
  id: number;
  qtd: string;
  duracao: string;
  unidade: 'min' | 'h' | 'dias';
}

let nextId = 1;

function toSeconds(duracao: string, unidade: 'min' | 'h' | 'dias'): number {
  const n = Number(duracao) || 0;
  return n * (unidade === 'min' ? 60 : unidade === 'h' ? 3600 : 86400);
}

// Acumula produção por segmentos de tempo conforme artefatos expiram
function computeAccumulated(
  continentMines: Mine[],
  factors: Factor[],
  somaOff: number,
  totalComprado: number,
  busterAnuncio: number,
  entries: ArtefatoEntry[],
): { accumulated: number; currentBoosterFactor: number } {
  const validEntries = entries.filter(e => Number(e.qtd) > 0 && toSeconds(e.duracao, e.unidade) > 0);
  if (validEntries.length === 0) return { accumulated: 0, currentBoosterFactor: 0 };

  // Ordena por duração crescente para construir os segmentos
  const sorted = [...validEntries]
    .map(e => ({ qtd: Number(e.qtd), seconds: toSeconds(e.duracao, e.unidade) }))
    .sort((a, b) => a.seconds - b.seconds);

  let accumulated = 0;
  let prevTime = 0;
  let activeQtd = sorted.reduce((s, e) => s + e.qtd, 0); // começa com tudo ativo

  for (let i = 0; i < sorted.length; i++) {
    const segEnd = sorted[i].seconds;
    const segDuration = segEnd - prevTime;

    if (segDuration > 0) {
      const boosterFactor = (somaOff + activeQtd + totalComprado) * busterAnuncio;
      const prod = computeProduction(continentMines, factors, boosterFactor);
      accumulated += prod.raw * segDuration;
    }

    activeQtd -= sorted[i].qtd; // artefato expira
    prevTime = segEnd;
  }

  const currentBoosterFactor = (somaOff + totalComprado) * busterAnuncio;
  return { accumulated, currentBoosterFactor };
}

export function PromocaoPanel({ continents, mines, factors, artefatos, boosterCfg, boosterTotal }: Props) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<ArtefatoEntry[]>([
    { id: nextId++, qtd: '', duracao: '', unidade: 'h' },
  ]);

  const busterAnuncio = boosterCfg.buster_anuncio ?? 0;
  const totalComprado = boosterCfg.total_comprado ?? 0;
  const somaOff = artefatos.filter(a => a.ativo).reduce((acc, a) => acc + a.quantidade, 0);

  const totalPromoQtd = entries.reduce((acc, e) => acc + (Number(e.qtd) || 0), 0);
  const totalPromoBooster = Math.round((somaOff + totalPromoQtd + totalComprado) * busterAnuncio * 10) / 10;

  const hasInput = entries.some(e => Number(e.qtd) > 0 && toSeconds(e.duracao, e.unidade) > 0);

  function addEntry() {
    setEntries(es => [...es, { id: nextId++, qtd: '', duracao: '', unidade: 'h' }]);
  }

  function removeEntry(id: number) {
    setEntries(es => es.filter(e => e.id !== id));
  }

  function updateEntry(id: number, field: Partial<Omit<ArtefatoEntry, 'id'>>) {
    setEntries(es => es.map(e => e.id === id ? { ...e, ...field } : e));
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{t('promo.header')}</h2>
      </div>

      <div className="promo-form-card">
        <div className="promo-field" style={{ flex: 1, minWidth: 280 }}>
          <div className="promo-entries-header">
            <span className="promo-field-label">{t('promo.artifacts')}</span>
            <span className="promo-field-label" style={{ width: 90, textAlign: 'right' }}>{t('promo.duration')}</span>
            <span className="promo-field-label" style={{ width: 70 }}></span>
          </div>

          <div className="promo-entries">
            {entries.map(e => (
              <div key={e.id} className="promo-entry-row">
                <input
                  type="number"
                  className="promo-input"
                  placeholder={t('promo.placeholder_artifacts')}
                  value={e.qtd}
                  onChange={ev => updateEntry(e.id, { qtd: ev.target.value })}
                />
                <input
                  type="number"
                  className="promo-input"
                  placeholder={t('promo.placeholder_duration')}
                  value={e.duracao}
                  onChange={ev => updateEntry(e.id, { duracao: ev.target.value })}
                  style={{ width: 70 }}
                />
                <select
                  className="promo-unit-select"
                  value={e.unidade}
                  onChange={ev => updateEntry(e.id, { unidade: ev.target.value as 'min' | 'h' | 'dias' })}
                >
                  <option value="min">{t('promo.minutes')}</option>
                  <option value="h">{t('promo.hours')}</option>
                  <option value="dias">{t('promo.days')}</option>
                </select>
                {entries.length > 1 && (
                  <button className="promo-btn-remove" onClick={() => removeEntry(e.id)}>×</button>
                )}
              </div>
            ))}
          </div>

          <div className="promo-entries-footer">
            <button className="promo-btn-add" onClick={addEntry}>+</button>
            {entries.length > 1 && totalPromoQtd > 0 && (
              <span className="promo-total-qtd">
                Total: <strong>{totalPromoQtd}</strong> {t('promo.artifacts')} · Booster {boosterTotal}x → <strong>{totalPromoBooster}x</strong>
              </span>
            )}
            {entries.length === 1 && totalPromoQtd > 0 && (
              <span className="promo-total-qtd">
                Booster {boosterTotal}x → <strong>{totalPromoBooster}x</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {hasInput ? (
        <div className="continents-list">
          {continents.map(continent => {
            const continentMines = mines.filter(m => m.continent_id === continent.id);
            if (continentMines.length === 0) return null;

            const nextPrestige = minNextPrestige(continentMines, factors);
            const currentBoosterFactor = boosterTotal / 10;
            const currentProduction = computeProduction(continentMines, factors, currentBoosterFactor);
            const promoProduction   = computeProduction(continentMines, factors, (somaOff + totalPromoQtd + totalComprado) * busterAnuncio);

            const { accumulated } = computeAccumulated(
              continentMines, factors, somaOff, totalComprado, busterAnuncio, entries
            );

            const hasPrestige = nextPrestige.raw > 0;
            const timeAtualSec = currentProduction.raw > 0 && hasPrestige
              ? nextPrestige.raw / currentProduction.raw : null;

            const vaiAtingir = hasPrestige && accumulated >= nextPrestige.raw;
            const pct = hasPrestige ? Math.min((accumulated / nextPrestige.raw) * 100, 100) : 0;

            const rowClass = !hasPrestige ? '' : vaiAtingir ? 'promo-row-vai' : 'promo-row-nao';

            return (
              <div key={continent.id} className={`promo-continent-row ${rowClass}`}>
                <div className="promo-row-grid">

                  <div className="promo-cell-name">
                    <strong className="continent-title">{continent.nome}</strong>
                  </div>

                  <div className="promo-cell">
                    <span className="promo-cell-label">{t('promo.production')}</span>
                    <span className="promo-cell-val">
                      <span className="promo-prod-atual">{currentProduction.display}</span>
                      <span className="promo-arrow-sep">→</span>
                      <span className="prod-value">{promoProduction.display}</span>
                    </span>
                  </div>

                  <div className="promo-cell">
                    <span className="promo-cell-label">{t('promo.next_prestige')}</span>
                    <span className="promo-cell-val">
                      <span className="prod-value prod-prestige">{hasPrestige ? nextPrestige.display : '—'}</span>
                      {hasPrestige && <span className="promo-mine-name">({nextPrestige.nome})</span>}
                    </span>
                  </div>

                  <div className="promo-cell">
                    <span className="promo-cell-label">{t('promo.without_promo')}</span>
                    <span className="promo-time-val promo-time-atual">
                      {timeAtualSec != null ? formatTime(timeAtualSec) : '—'}
                    </span>
                  </div>

                  <div className="promo-cell-result">
                    {hasPrestige && (
                      <>
                        <span className="promo-pct-label-only" style={{ color: vaiAtingir ? 'var(--ok)' : '#e05555' }}>
                          {pct.toFixed(0)}%
                        </span>
                        <span className={`promo-status-icon ${vaiAtingir ? 'promo-status-vai' : 'promo-status-nao'}`}>
                          {vaiAtingir ? '✓' : '✗'}
                        </span>
                      </>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="no-mines" style={{ marginTop: 24 }}>
          {t('promo.empty')}
        </p>
      )}
    </section>
  );
}
