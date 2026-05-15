import { useState } from 'react';
import type { Island, Mine, Factor } from '../types';
import { MinesTable } from './MinesTable';
import { BoosterBar, type BoosterInfo } from './BoosterBar';
import { computeUpgradeHints } from '../utils/upgradeAdvisor';

interface Props {
  islands: Island[];
  mines: Mine[];
  factors: Factor[];
  boosterTotal?: number;
  boosterInfo?: BoosterInfo;
  targetPct?: number;
  onMineUpdate: (updated: Mine) => void;
}

function roundByMagnitude(n: number): number {
  if (n < 10)  return Math.round(n * 100) / 100;
  if (n < 100) return Math.round(n * 10)  / 10;
  return Math.round(n);
}

function computeProduction(mines: Mine[], factors: Factor[], boosterFactor: number): { display: string; raw: number } {
  const factorMap = new Map(factors.map(f => [f.letra, f]));
  const values: Array<{ nivel: number; cont: number }> = [];

  for (const m of mines) {
    const components = [
      { nivel: m.armazem_nivel,  letra: m.armazem_letra },
      { nivel: m.elevador_nivel, letra: m.elevador_letra },
      { nivel: m.extracao_nivel, letra: m.extracao_letra },
    ];
    if (components.some(c => c.nivel == null || !c.letra)) continue;
    const scored = components.map(c => {
      const cont = factorMap.get(c.letra!)?.cont ?? 1;
      const n = c.nivel ?? 0;
      return { nivel: n, cont, score: (cont - 1) * 100 + Math.log10(n > 0 ? n : 0.001) };
    });
    const min = scored.reduce((a, b) => a.score < b.score ? a : b);
    if (min.nivel > 0) values.push({ nivel: min.nivel, cont: min.cont });
  }

  if (values.length === 0) return { display: '—', raw: 0 };

  const maxCont = Math.max(...values.map(v => v.cont));
  let total = 0;
  for (const v of values) {
    total += v.nivel / Math.pow(1000, maxCont - v.cont);
  }
  if (boosterFactor > 0) total *= boosterFactor;

  const sorted = [...factors].sort((a, b) => a.cont - b.cont);
  let cont = maxCont;
  while (total >= 1000 && cont < sorted[sorted.length - 1].cont) {
    total /= 1000;
    cont++;
  }

  const letra = sorted.find(f => f.cont === cont)?.letra ?? '?';
  // raw = total_normalized * 1000^(cont-1), computed via ratio to avoid huge intermediates
  const raw = total * Math.pow(1000, cont - 1);
  return { display: `${roundByMagnitude(total)}${letra}`, raw };
}

function minNextPrestige(mines: Mine[], factors: Factor[]): { display: string; raw: number } {
  const factorMap = new Map(factors.map(f => [f.letra, f]));
  const candidates = mines
    .filter(m => m.proximo_prestigio_valor != null && m.proximo_prestigio_letra)
    .map(m => {
      const cont = factorMap.get(m.proximo_prestigio_letra!)?.cont ?? 1;
      const valor = m.proximo_prestigio_valor!;
      return {
        nome: m.nome,
        valor,
        letra: m.proximo_prestigio_letra!,
        score: (cont - 1) * 100 + Math.log10(valor > 0 ? valor : 0.001),
        raw: valor * Math.pow(1000, cont - 1),
      };
    });
  if (candidates.length === 0) return { display: '—', raw: 0 };
  const min = candidates.reduce((a, b) => a.score < b.score ? a : b);
  return { display: `${min.valor}${min.letra} (${min.nome})`, raw: min.raw };
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

type BalanceStatus = 'ok' | 'warn' | 'bad' | 'unknown';

function islandBalance(islandMines: Mine[], factors: Factor[]): BalanceStatus {
  const factorMap = new Map(factors.map(f => [f.letra, f]));
  if (islandMines.length < 2) return 'unknown';

  const withData = islandMines.filter(
    m => m.proximo_prestigio_valor != null && m.proximo_prestigio_letra
  );
  if (withData.length < 2) return 'unknown';

  // prestige rank: lowest next prestige score = rank 1
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

  // pct rank: lowest raw bottleneck = rank 1
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

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function IslandPanel({ islands, mines, factors, boosterTotal, boosterInfo, targetPct, onMineUpdate }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Ilhas</h2>
        {boosterInfo && <BoosterBar info={boosterInfo} />}
      </div>
      <div className="islands-list">
        {islands.map(island => {
          const islandMines = mines.filter(m => m.island_id === island.id);
          const isExpanded = expandedId === island.id;
          const upgradeHints = computeUpgradeHints(islandMines, factors);
          const production  = computeProduction(islandMines, factors, (boosterTotal ?? 0) / 10);
          const nextPrestige = minNextPrestige(islandMines, factors);
          const timeEst = production.raw > 0 && nextPrestige.raw > 0
            ? formatTime(nextPrestige.raw / production.raw)
            : '—';
          const balance = islandBalance(islandMines, factors);

          return (
            <div key={island.id} className="island-row">
              <div className="island-summary">
                <div className="island-name-area">
                  <button
                    className={`island-toggle ${isExpanded ? 'open' : ''}`}
                    onClick={() => setExpandedId(isExpanded ? null : island.id)}
                  >
                    {isExpanded ? '▾' : '▸'}
                  </button>
                  <strong className="island-title">{island.nome}</strong>
                  <span className="mine-count">{islandMines.length} minas</span>
                  {production.display !== '—' && (
                    <span className="island-production">
                      <span className="prod-label">Produção</span>
                      <span className="prod-value">{production.display}</span>
                    </span>
                  )}
                  {nextPrestige.display !== '—' && (
                    <span className="island-production">
                      <span className="prod-label">Próx. Prestígio</span>
                      <span className="prod-value prod-prestige">{nextPrestige.display}</span>
                    </span>
                  )}
                  {timeEst !== '—' && (
                    <span className="island-production">
                      <span className="prod-label">Tempo</span>
                      <span className="prod-value prod-prestige">{timeEst}</span>
                    </span>
                  )}
                  {balance !== 'unknown' && (
                    <span className="island-balance">
                      <span className={`status-bullet ${balance === 'ok' ? 'bullet-green' : balance === 'warn' ? 'bullet-warn' : 'bullet-red'}`} />
                      <span className={`balance-label balance-${balance}`}>
                        {balance === 'ok' ? 'Equilibrado' : 'Trabalhar'}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="island-mines">
                  <MinesTable
                    mines={islandMines}
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
