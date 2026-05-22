import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Continent, Mine, Factor } from '../types';
import { MinesTable } from './MinesTable';
import { BoosterBar, type BoosterInfo } from './BoosterBar';
import { computeUpgradeHints } from '../utils/upgradeAdvisor';
import { computeProduction, minNextPrestige } from '../utils/gameCalc';

interface Props {
  continents: Continent[];
  mines: Mine[];
  factors: Factor[];
  boosterTotal?: number;
  boosterInfo?: BoosterInfo;
  targetPct?: number;
  onMineUpdate: (updated: Mine) => void;
}

function mineRawBottleneck(m: Mine, factors: Factor[]): number {
  const factorMap = new Map(factors.map(f => [f.letra, f]));
  const comps = [
    { nivel: m.armazem_nivel,  letra: m.armazem_letra },
    { nivel: m.elevador_nivel, letra: m.elevador_letra },
    { nivel: m.extracao_nivel, letra: m.extracao_letra },
  ];
  if (comps.some(c => c.nivel == null || !c.letra)) return 0;
  const scored = comps.map(c => {
    const cont = factorMap.get(c.letra!)?.cont ?? 1;
    const n = c.nivel ?? 0;
    return { cont, n, score: (cont - 1) * 100 + Math.log10(n > 0 ? n : 0.001) };
  });
  const min = scored.reduce((a, b) => a.score < b.score ? a : b);
  return min.n * Math.pow(1000, min.cont - 1);
}

function scoreNum(nivel: number | null, letra: string | null, factors: Factor[]): number {
  if (nivel == null || !letra) return -Infinity;
  const cont = factors.find(f => f.letra === letra)?.cont ?? 1;
  return (cont - 1) * 100 + Math.log10(nivel > 0 ? nivel : 0.001);
}

function extracaoContinentStatus(continentMines: Mine[], factors: Factor[]): 'green' | 'red' | null {
  const withData = continentMines.filter(m =>
    m.armazem_nivel != null && m.armazem_letra &&
    m.elevador_nivel != null && m.elevador_letra &&
    m.extracao_nivel != null && m.extracao_letra
  );
  if (withData.length === 0) return null;
  const allMin = withData.every(m => {
    const a = scoreNum(m.armazem_nivel,  m.armazem_letra,  factors);
    const e = scoreNum(m.elevador_nivel, m.elevador_letra, factors);
    const x = scoreNum(m.extracao_nivel, m.extracao_letra, factors);
    return x <= Math.min(a, e) + 1e-9;
  });
  return allMin ? 'green' : 'red';
}

type BalanceStatus = 'ok' | 'warn' | 'bad' | 'unknown';

function continentBalance(continentMines: Mine[], factors: Factor[]): BalanceStatus {
  const factorMap = new Map(factors.map(f => [f.letra, f]));
  if (continentMines.length < 2) return 'unknown';

  const withData = continentMines.filter(
    m => m.proximo_prestigio_valor != null && m.proximo_prestigio_letra
  );
  if (withData.length < 2) return 'unknown';

  const prestigeSorted = [...withData].sort((a, b) => {
    const sc = (m: Mine) => {
      const cont = factorMap.get(m.proximo_prestigio_letra!)?.cont ?? 1;
      const v = m.proximo_prestigio_valor!;
      return (cont - 1) * 100 + Math.log10(v > 0 ? v : 0.001);
    };
    return sc(a) - sc(b);
  });
  const prestigeRank: Record<number, number> = {};
  prestigeSorted.forEach((m, i) => { prestigeRank[m.id] = i + 1; });

  const pctSorted = [...withData].sort(
    (a, b) => mineRawBottleneck(a, factors) - mineRawBottleneck(b, factors)
  );
  const pctRank: Record<number, number> = {};
  pctSorted.forEach((m, i) => { pctRank[m.id] = i + 1; });

  let maxDiff = 0;
  for (const m of withData) {
    const diff = Math.abs((prestigeRank[m.id] ?? 0) - (pctRank[m.id] ?? 0));
    if (diff > maxDiff) maxDiff = diff;
  }

  if (maxDiff === 0) return 'ok';
  if (maxDiff === 1) return 'warn';
  return 'bad';
}

interface TimeLabels { year: string; month: string; day: string; hour: string; }

function formatTime(seconds: number, lbl: TimeLabels): string {
  if (!isFinite(seconds) || seconds <= 0) return '—';
  const totalDays = Math.floor(seconds / 86400);
  const years  = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days   = totalDays % 30;
  const hours  = Math.floor((seconds % 86400) / 3600);
  const parts: string[] = [];
  if (years  > 0) parts.push(`${years}${lbl.year}`);
  if (months > 0) parts.push(`${months}${lbl.month}`);
  if (days   > 0) parts.push(`${days}${lbl.day}`);
  if (hours  > 0 || parts.length === 0) parts.push(`${hours}${lbl.hour}`);
  return parts.join(' ');
}

function timeColorClass(seconds: number): 'time-purple' | 'time-red' | 'time-warn' | 'time-green' {
  const days = seconds / 86400;
  if (days > 365) return 'time-purple';
  if (days > 30)  return 'time-red';
  if (days > 10)  return 'time-warn';
  return 'time-green';
}

function estimatedDateTooltip(seconds: number, label: string): string {
  if (!isFinite(seconds) || seconds <= 0) return '';
  const d = new Date(Date.now() + seconds * 1000);
  const date = d.toLocaleDateString();
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${label}: ${date} ${time}`;
}

export function ContinentPanel({ continents, mines, factors, boosterTotal, boosterInfo, targetPct, onMineUpdate }: Props) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const timeLbl: TimeLabels = {
    year:  t('continents.time_year'),
    month: t('continents.time_month'),
    day:   t('continents.time_day'),
    hour:  t('continents.time_hour'),
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{t('continents.header')}</h2>
        {boosterInfo && <BoosterBar info={boosterInfo} />}
      </div>

      <div className="continents-table-header">
        <div className="continents-th">{t('continents.col_continent')}</div>
        <div className="continents-th">{t('continents.col_prestiges')}</div>
        <div className="continents-th continents-th-right">{t('continents.col_production')}</div>
        <div className="continents-th continents-th-right">{t('continents.col_next_prestige')}</div>
        <div className="continents-th continents-th-right">{t('continents.col_time')}</div>
        <div className="continents-th continents-th-end">{t('continents.col_balance')}</div>
      </div>

      <div className="continents-list">
        {continents.map(continent => {
          const continentMines = mines.filter(m => m.continent_id === continent.id);
          const isExpanded     = expandedId === continent.id;
          const upgradeHints   = computeUpgradeHints(continentMines, factors, targetPct ?? 100, (boosterTotal ?? 0) / 10);
          const extStatus      = extracaoContinentStatus(continentMines, factors);
          const production     = computeProduction(continentMines, factors, (boosterTotal ?? 0) / 10);
          const nextPrestige   = minNextPrestige(continentMines, factors);
          const timeSeconds    = production.raw > 0 && nextPrestige.raw > 0
            ? nextPrestige.raw / production.raw : 0;
          const timeEst        = formatTime(timeSeconds, timeLbl);
          const timeCls        = timeSeconds > 0 ? timeColorClass(timeSeconds) : '';
          const timeTooltip    = estimatedDateTooltip(timeSeconds, t('continents.estimated_date'));
          const balance        = continentBalance(continentMines, factors);
          const totalAtual     = continentMines.reduce((s, m) => s + (m.prestigio_atual  ?? 0), 0);
          const totalMaximo    = continentMines.reduce((s, m) => s + (m.prestigio_maximo ?? 0), 0);

          return (
            <div key={continent.id} className="continent-row">
              <div className="continent-summary">

                <div className="isl-col-name">
                  <button
                    className={`continent-toggle ${isExpanded ? 'open' : ''}`}
                    onClick={() => setExpandedId(isExpanded ? null : continent.id)}
                  >
                    {isExpanded ? '▾' : '▸'}
                  </button>
                  {extStatus && (
                    <span
                      className={`status-bullet ${extStatus === 'green' ? 'bullet-green' : 'bullet-red'}`}
                      title={extStatus === 'green' ? t('continents.tooltip_extraction_ok') : t('continents.tooltip_extraction_nok')}
                    />
                  )}
                  <strong className="continent-title">{continent.nome}</strong>
                  <span className="mine-count">{t('continents.mines_count', { count: continentMines.length })}</span>
                </div>

                <div className="isl-col-val isl-col-prestiges" data-label={t('continents.col_prestiges')}>
                  {totalMaximo > 0
                    ? <span className={`sc-value sc-prestige-count${totalAtual === totalMaximo ? ' maxed' : ''}`}>{totalAtual} / {totalMaximo}</span>
                    : <span className="isl-empty">—</span>}
                </div>

                <div className="isl-col-val" data-label={t('continents.col_production')}>
                  {production.display !== '—'
                    ? <span className="prod-value">{production.display}</span>
                    : <span className="isl-empty">—</span>}
                </div>

                <div className="isl-col-val" data-label={t('continents.col_next_prestige')}>
                  {nextPrestige.raw > 0
                    ? <span className="prod-value prod-prestige">{nextPrestige.display} ({nextPrestige.nome})</span>
                    : <span className="isl-empty">—</span>}
                </div>

                <div className="isl-col-val" data-label={t('continents.col_time')}>
                  {timeEst !== '—'
                    ? <span className={`time-badge ${timeCls}`} title={timeTooltip}>{timeEst}</span>
                    : <span className="isl-empty">—</span>}
                </div>

                <div className="isl-col-val" data-label={t('continents.col_balance')}>
                  {balance !== 'unknown' && (
                    <span className="continent-balance">
                      <span className={`status-bullet ${balance === 'ok' ? 'bullet-green' : balance === 'warn' ? 'bullet-warn' : 'bullet-red'}`} />
                      <span className={`balance-label balance-${balance}`}>
                        {balance === 'ok' ? t('continents.balanced') : t('continents.needs_work')}
                      </span>
                    </span>
                  )}
                </div>

              </div>

              {isExpanded && (
                <div className="continent-mines">
                  <MinesTable
                    mines={continentMines}
                    factors={factors}
                    boosterTotal={boosterTotal}
                    upgradeHints={upgradeHints}
                    targetPct={targetPct}
                    onUpdate={onMineUpdate}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
