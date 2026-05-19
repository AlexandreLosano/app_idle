import { useState } from 'react';
import type { Mine, Island, Factor } from '../types';
import { api } from '../api/client';

interface Props {
  islands: Island[];
  mines: Mine[];
  factors: Factor[];
  boosterTotal: number;
  multOff?: number | null;
  horasSonoInit?: number | null;
}

function roundByMagnitude(n: number): number {
  if (n < 10)  return Math.round(n * 100) / 100;
  if (n < 100) return Math.round(n * 10)  / 10;
  return Math.round(n);
}

function computeProductionRaw(mines: Mine[], factors: Factor[], boosterFactor: number): number {
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

  if (values.length === 0) return 0;

  const maxCont = Math.max(...values.map(v => v.cont));
  let total = 0;
  for (const v of values) {
    total += v.nivel / Math.pow(1000, maxCont - v.cont);
  }
  if (boosterFactor > 0) total *= boosterFactor;

  return total * Math.pow(1000, maxCont - 1);
}

function formatRaw(raw: number, factors: Factor[]): string {
  if (raw <= 0) return '—';
  const sorted = [...factors].sort((a, b) => a.cont - b.cont);
  let value = raw;
  let idx = 0;
  while (value >= 1000 && idx < sorted.length - 1) {
    value /= 1000;
    idx++;
  }
  return `${roundByMagnitude(value)}${sorted[idx].letra}`;
}

function minNextPrestigeRaw(mines: Mine[], factors: Factor[]): number {
  const factorMap = new Map(factors.map(f => [f.letra, f]));
  const candidates = mines
    .filter(m => m.proximo_prestigio_valor != null && m.proximo_prestigio_letra)
    .map(m => {
      const cont = factorMap.get(m.proximo_prestigio_letra!)?.cont ?? 1;
      return m.proximo_prestigio_valor! * Math.pow(1000, cont - 1);
    });
  if (candidates.length === 0) return 0;
  return Math.min(...candidates);
}


export function ProducaoPanel({ islands, mines, factors, boosterTotal, multOff, horasSonoInit }: Props) {
  const [multInput, setMultInput] = useState(() => String(multOff ?? 3));
  const [sonoInput, setSonoInput] = useState(() => String(horasSonoInit ?? 8));
  const [saved, setSaved] = useState(false);

  const boosterFactor = boosterTotal / 10;
  const mult  = Math.max(1, Number(multInput) || 1);
  const sono  = Math.max(0, Number(sonoInput) || 0);
  const hasMult = mult > 1;

  const columns: { label: string; mult: number; noMult?: boolean; isPrestige?: boolean; highlight: null | 'warn' | 'ok' | 'always' }[] = [
    { label: 'REAL',            mult: 1,            noMult: true,     highlight: 'always' },
    { label: 'Próx. Prestígio', mult: 0,            isPrestige: true, highlight: null    },
    { label: '/s',              mult: 1,                               highlight: null    },
    { label: '/min',            mult: 60,                              highlight: null    },
    { label: '/hora',           mult: 3_600,                           highlight: 'ok'   },
    { label: 'Sono',            mult: 3_600 * sono,                    highlight: 'ok'   },
    { label: '/dia',            mult: 86_400,                          highlight: 'warn' },
    { label: '/semana',         mult: 604_800,                         highlight: null   },
  ];

  const rows = islands.map(island => {
    const islandMines = mines.filter(m => m.island_id === island.id);
    const raw = computeProductionRaw(islandMines, factors, boosterFactor);
    const nextPrestigeRaw = minNextPrestigeRaw(islandMines, factors);
    return { island, raw, nextPrestigeRaw };
  });

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Produção por Período</h2>
      </div>

      <div className="prod-mult-bar">
        <span className="prod-mult-label">Multiplicador de anúncio offline</span>
        <input
          type="number"
          className="prod-mult-input"
          value={multInput}
          min={1}
          onChange={e => { setMultInput(e.target.value); setSaved(false); }}
        />
        {hasMult && <span className="prod-mult-badge">×{mult} aplicado</span>}

        <span className="prod-mult-divider" />

        <span className="prod-mult-label">Horas de sono</span>
        <input
          type="number"
          className="prod-mult-input"
          value={sonoInput}
          min={0}
          max={24}
          onChange={e => { setSonoInput(e.target.value); setSaved(false); }}
        />

        <button
          className={`btn-row-save${saved ? ' saved' : ''}`}
          onClick={async () => {
            await api.artefatos.updateConfig({
              mult_off: Number(multInput) || 1,
              horas_sono: Number(sonoInput) || 0,
            });
            setSaved(true);
          }}
        >
          {saved ? '✓' : 'Salvar'}
        </button>
      </div>

      <div className="prod-table-wrap">
        <table className="prod-table">
          <thead>
            <tr>
              <th className="prod-th-ilha">Ilha</th>
              {columns.map(c => (
                <th key={c.label} className="prod-th-val">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ island, raw, nextPrestigeRaw }) => (
              <tr key={island.id} className={raw === 0 ? 'prod-row-empty' : ''}>
                <td className="prod-td-ilha">{island.nome}</td>
                {columns.map(c => {
                  if (c.isPrestige) {
                    return (
                      <td key={c.label} className="prod-td-val prod-td-purple">
                        {nextPrestigeRaw > 0 ? formatRaw(nextPrestigeRaw, factors) : '—'}
                      </td>
                    );
                  }
                  const valor = raw * c.mult * (c.noMult ? 1 : mult);
                  const atinge = (c.highlight === 'warn' || c.highlight === 'ok') && nextPrestigeRaw > 0 && valor >= nextPrestigeRaw;
                  const cls =
                    c.highlight === 'always'        ? ' prod-td-prestige' :
                    atinge && c.highlight === 'ok'  ? ' prod-td-sono'     :
                    atinge                          ? ' prod-td-prestige'  : '';
                  return (
                    <td key={c.label} className={`prod-td-val${cls}`}>
                      {raw > 0 ? formatRaw(valor, factors) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
