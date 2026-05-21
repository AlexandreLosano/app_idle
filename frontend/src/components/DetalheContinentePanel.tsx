import { useEffect, useState } from 'react';
import type { Continent, Mine, Factor } from '../types';
import { api } from '../api/client';
import { formatRaw } from '../utils/upgradeAdvisor';

interface Props {
  continents: Continent[];
  mines: Mine[];
  factors: Factor[];
  boosterTotal: number;
}

function scorePrestige(m: Mine, factors: Factor[]): number {
  if (m.proximo_prestigio_valor == null || !m.proximo_prestigio_letra) return Infinity;
  const cont = factors.find(f => f.letra === m.proximo_prestigio_letra)?.cont ?? 1;
  return (cont - 1) * 100 + Math.log10(m.proximo_prestigio_valor > 0 ? m.proximo_prestigio_valor : 0.001);
}

function mineBottleneckRaw(m: Mine, factors: Factor[]): number {
  const comps = [
    { nivel: m.armazem_nivel,  letra: m.armazem_letra  },
    { nivel: m.elevador_nivel, letra: m.elevador_letra  },
    { nivel: m.extracao_nivel, letra: m.extracao_letra  },
  ];
  if (comps.some(c => c.nivel == null || !c.letra)) return 0;
  const scored = comps.map(c => {
    const cont = factors.find(f => f.letra === c.letra)?.cont ?? 1;
    const n = c.nivel ?? 0;
    return { cont, n, score: (cont - 1) * 100 + Math.log10(n > 0 ? n : 0.001) };
  });
  const min = scored.reduce((a, b) => a.score < b.score ? a : b);
  return min.n * Math.pow(1000, min.cont - 1);
}

const NIVEIS_COLS: { key: string; label: string }[] = [
   { key: 'E', label: 'Elevador' },
   { key: 'A', label: 'Armazém' },
  ...[25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map(n => ({ key: String(n), label: String(n) })),
];

export function DetalheContinentePanel({ continents, mines, factors, boosterTotal }: Props) {
  const [selectedContinentId, setSelectedContinentId] = useState<number | ''>('');
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const boosterFactor = boosterTotal / 10;

  const continentMines = selectedContinentId !== ''
    ? mines.filter(m => m.continent_id === selectedContinentId)
    : [];

  useEffect(() => {
    if (selectedContinentId === '') return;
    const ids = mines.filter(m => m.continent_id === selectedContinentId).map(m => m.id);
    if (ids.length === 0) return;
    api.detalheValores.list(ids).then(rows => {
      const next: Record<string, string> = {};
      for (const r of rows) next[`${r.mine_id}-${r.col_key}`] = r.valor;
      setInputValues(next);
    });
  }, [selectedContinentId]);

  function getInput(mineId: number, key: string): string {
    return inputValues[`${mineId}-${key}`] ?? '';
  }

  function setInput(mineId: number, key: string, val: string) {
    setInputValues(prev => ({ ...prev, [`${mineId}-${key}`]: val }));
  }

  function handleBlur(mineId: number, key: string, val: string) {
    api.detalheValores.save(mineId, key, val);
  }

  const prestigeRanks: Record<number, number> = {};
  const sorted = [...continentMines]
    .filter(m => isFinite(scorePrestige(m, factors)))
    .sort((a, b) => scorePrestige(a, factors) - scorePrestige(b, factors));
  sorted.forEach((m, i) => { prestigeRanks[m.id] = i + 1; });

  const rank3Mine = continentMines.find(m => prestigeRanks[m.id] === 3);

  function isCapped800(key: string, val: string): boolean {
    const n = Number(key);
    return n >= 25 && n <= 35 && val === '800';
  }

  function getCellColor(mineId: number, key: string): 'cell-cyan' | 'cell-purple' | 'cell-green' | 'cell-yellow' | 'cell-red' | '' {
    const val = getInput(mineId, key);
    if (isCapped800(key, val)) return 'cell-cyan';
    if (!rank3Mine) return '';
    const ref = parseFloat(getInput(rank3Mine.id, key));
    const own = parseFloat(val);
    if (isNaN(ref) || isNaN(own) || val === '') return '';
    if (own > ref)      return 'cell-purple';
    if (own === ref)    return 'cell-green';
    if (ref - own <= 3) return 'cell-yellow';
    return 'cell-red';
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Detalhe de Continente</h2>
      </div>

      <div className="detalhe-filters">
        <div className="detalhe-filter-group">
          <span className="detalhe-filter-label">Continente</span>
          <select
            className="detalhe-select"
            value={selectedContinentId}
            onChange={e => setSelectedContinentId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">Selecionar continente…</option>
            {continents.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {continentMines.length > 0 && (
        <div className="detalhe-result-wrap">
          <table className="detalhe-result-table">
            <thead>
              <tr>
                <th className="detalhe-res-th-nome detalhe-th-rowspan" rowSpan={2}>Mina</th>
                <th className="detalhe-niveis-header" colSpan={NIVEIS_COLS.length}>NÍVEIS</th>
                <th className="detalhe-res-th detalhe-th-rowspan" rowSpan={2}>Produção<br/>atual</th>
                <th className="detalhe-res-th detalhe-th-rowspan" rowSpan={2}>Ordem<br/>Prestígio</th>
              </tr>
              <tr>
                {NIVEIS_COLS.map(c => (
                  <th key={c.key} className="detalhe-sub-th">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {continentMines.map(mine => {
                const raw  = mineBottleneckRaw(mine, factors) * boosterFactor;
                const rank = prestigeRanks[mine.id];
                return (
                  <tr key={mine.id}>
                    <td className="detalhe-res-td-nome">{mine.nome}</td>
                    {NIVEIS_COLS.map((c, i) => {
                      const color = getCellColor(mine.id, c.key);
                      const locked = color === 'cell-cyan';
                      return (
                        <td key={c.key} className={`detalhe-input-td${i === 0 ? ' detalhe-input-td-first' : ''}${i === NIVEIS_COLS.length - 1 ? ' detalhe-input-td-last' : ''}`}>
                          <input
                            className={`detalhe-col-input ${color}`}
                            type="text"
                            value={getInput(mine.id, c.key)}
                            readOnly={locked}
                            onChange={locked ? undefined : e => setInput(mine.id, c.key, e.target.value)}
                            onBlur={locked ? undefined : e => handleBlur(mine.id, c.key, e.target.value)}
                          />
                        </td>
                      );
                    })}
                    <td className="detalhe-res-td">{formatRaw(raw, factors)}</td>
                    <td className="detalhe-res-td">
                      {rank != null ? (
                        <span className="detalhe-rank">#{rank}</span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedContinentId !== '' && continentMines.length === 0 && (
        <p className="no-mines" style={{ marginTop: 20 }}>Nenhuma mina cadastrada neste continente.</p>
      )}
    </section>
  );
}
