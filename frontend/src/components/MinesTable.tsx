import { useState, useEffect } from 'react';
import type { Mine, Factor, Island } from '../types';
import { api } from '../api/client';
import { UpgradeArrow } from './UpgradeArrow';
import { formatRaw } from '../utils/upgradeAdvisor';
import type { UpgradeHint } from '../utils/upgradeAdvisor';

interface Props {
  mines: Mine[];
  factors: Factor[];
  islands?: Island[];
  showIsland?: boolean;
  boosterTotal?: number;
  readOnly?: boolean;
  upgradeHints?: Record<number, UpgradeHint | null>;
  targetPct?: number;
  onUpdate: (updated: Mine) => void;
}

type FormRow = {
  armazem_nivel: string;
  armazem_letra: string;
  elevador_nivel: string;
  elevador_letra: string;
  extracao_nivel: string;
  extracao_letra: string;
  prestigio_atual: string;
  prestigio_maximo: string;
  proximo_prestigio_valor: string;
  proximo_prestigio_letra: string;
  island_id: string;
};

function toForm(m: Mine): FormRow {
  return {
    armazem_nivel:            m.armazem_nivel?.toString()            ?? '',
    armazem_letra:            m.armazem_letra                        ?? '',
    elevador_nivel:           m.elevador_nivel?.toString()           ?? '',
    elevador_letra:           m.elevador_letra                       ?? '',
    extracao_nivel:           m.extracao_nivel?.toString()           ?? '',
    extracao_letra:           m.extracao_letra                       ?? '',
    prestigio_atual:          m.prestigio_atual?.toString()          ?? '0',
    prestigio_maximo:         m.prestigio_maximo?.toString()         ?? '0',
    proximo_prestigio_valor:  m.proximo_prestigio_valor?.toString()  ?? '',
    proximo_prestigio_letra:  m.proximo_prestigio_letra              ?? '',
    island_id:                m.island_id?.toString()                ?? '',
  };
}

// Retorna score comparável usando a ordem da letra + nível
function score(nivel: string, letra: string, factors: Factor[]): number {
  if (!nivel || !letra) return -Infinity;
  const f = factors.find(f => f.letra === letra);
  const cont = f ? f.cont : 1;
  const n = parseFloat(nivel) || 0;
  return (cont - 1) * 100 + Math.log10(n > 0 ? n : 0.001);
}

function minScore(f: FormRow, factors: Factor[]): { nivel: string; letra: string } | null {
  const candidates = [
    { nivel: f.armazem_nivel,  letra: f.armazem_letra  },
    { nivel: f.elevador_nivel, letra: f.elevador_letra  },
    { nivel: f.extracao_nivel, letra: f.extracao_letra  },
  ].filter(c => c.nivel && c.letra);
  if (candidates.length < 3) return null;
  return candidates.reduce((min, c) =>
    score(c.nivel, c.letra, factors) < score(min.nivel, min.letra, factors) ? c : min
  );
}

function rawBottleneck(f: FormRow, factors: Factor[]): number {
  const b = minScore(f, factors);
  if (!b) return 0;
  const factor = factors.find(fac => fac.letra === b.letra);
  if (!factor) return 0;
  const n = parseFloat(b.nivel);
  return n * Math.pow(1000, factor.cont - 1);
}

function roundByMagnitude(n: number): number {
  if (n < 10)  return Math.round(n * 100) / 100;
  if (n < 100) return Math.round(n * 10)  / 10;
  return Math.round(n);
}

function boostedDisplay(nivel: string, letra: string, booster: number, factors: Factor[]): string {
  const f = factors.find(fac => fac.letra === letra);
  if (!f) return '—';
  const n = parseFloat(nivel);
  if (!n || n <= 0 || booster <= 0) return '—';

  // Multiplicação direta (igual ao Excel: I7*G2 depois M7/O7), sem log/exp
  let result = n * booster;
  let cont = f.cont;
  const maxCont = Math.max(...factors.map(fac => fac.cont));

  while (result >= 1000 && cont < maxCont) {
    result /= 1000;
    cont++;
  }

  const newFactor = factors.find(fac => fac.cont === cont);
  if (!newFactor) return '—';
  return `${roundByMagnitude(result)}${newFactor.letra}`;
}

function extracaoStatus(f: FormRow, factors: Factor[]): 'min' | 'notmin' | 'unknown' {
  const a = score(f.armazem_nivel,  f.armazem_letra,  factors);
  const e = score(f.elevador_nivel, f.elevador_letra, factors);
  const x = score(f.extracao_nivel, f.extracao_letra, factors);
  if (!isFinite(a) || !isFinite(e) || !isFinite(x)) return 'unknown';
  return x <= Math.min(a, e) + 1e-9 ? 'min' : 'notmin';
}

export function MinesTable({ mines, factors, islands = [], showIsland = false, boosterTotal = 0, readOnly = false, upgradeHints, targetPct = 10, onUpdate }: Props) {
  const [rows,   setRows]   = useState<Record<number, FormRow>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved,  setSaved]  = useState<Record<number, boolean>>({});
  const [dirty,  setDirty]  = useState<Record<number, boolean>>({});

  useEffect(() => {
    setRows(prev => {
      const next: Record<number, FormRow> = {};
      mines.forEach(m => { next[m.id] = prev[m.id] ?? toForm(m); });
      return next;
    });
  }, [mines]);

  function set(id: number, field: keyof FormRow, value: string) {
    setRows(r => ({ ...r, [id]: { ...r[id], [field]: value } }));
    setSaved(s => ({ ...s, [id]: false }));
    setDirty(d => ({ ...d, [id]: true }));
  }

  async function handleSaveRow(m: Mine) {
    const f = rows[m.id];
    if (!f) return;
    setSaving(s => ({ ...s, [m.id]: true }));
    try {
      const updated = await api.mines.update(m.nome, {
        armazem_nivel:    f.armazem_nivel    ? parseFloat(f.armazem_nivel)  : undefined,
        armazem_letra:    f.armazem_letra    || undefined,
        elevador_nivel:   f.elevador_nivel   ? parseFloat(f.elevador_nivel) : undefined,
        elevador_letra:   f.elevador_letra   || undefined,
        extracao_nivel:   f.extracao_nivel   ? parseFloat(f.extracao_nivel) : undefined,
        extracao_letra:   f.extracao_letra   || undefined,
        prestigio_atual:           f.prestigio_atual          ? parseInt(f.prestigio_atual)                : undefined,
        prestigio_maximo:          f.prestigio_maximo         ? parseInt(f.prestigio_maximo)               : undefined,
        proximo_prestigio_valor:   f.proximo_prestigio_valor  ? parseFloat(f.proximo_prestigio_valor)      : undefined,
        proximo_prestigio_letra:   f.proximo_prestigio_letra  || undefined,
      });
      setRows(r => ({ ...r, [m.id]: toForm(updated) }));
      onUpdate(updated);
      setSaved(s => ({ ...s, [m.id]: true }));
      setDirty(d => ({ ...d, [m.id]: false }));
    } finally {
      setSaving(s => ({ ...s, [m.id]: false }));
    }
  }

  const letras = factors.map(f => f.letra);

  const rawMap: Record<number, number> = {};
  const islandRawTotals: Record<number, number> = {};
  mines.forEach(m => {
    const f = rows[m.id];
    const raw = f ? rawBottleneck(f, factors) : 0;
    rawMap[m.id] = raw;
    const key = m.island_id ?? 0;
    islandRawTotals[key] = (islandRawTotals[key] ?? 0) + raw;
  });

  // Ranking de ordem de prestígio: menor próximo prestígio = fazer primeiro
  const prestigeRank: Record<number, number> = {};
  const rankable = mines
    .map(m => {
      const f = rows[m.id];
      const valor = f?.proximo_prestigio_valor ? parseFloat(f.proximo_prestigio_valor) : null;
      const letra = f?.proximo_prestigio_letra ?? '';
      if (!valor || !letra) return { id: m.id, sc: Infinity };
      return { id: m.id, sc: score(valor.toString(), letra, factors) };
    })
    .sort((a, b) => a.sc - b.sc);
  rankable.forEach((r, i) => {
    prestigeRank[r.id] = r.sc === Infinity ? 0 : i + 1;
  });

  // Ranking por % de produção: menor % = rank 1
  const pctRank: Record<number, number> = {};
  const islandGroups: Record<number, Mine[]> = {};
  mines.forEach(m => {
    const key = m.island_id ?? 0;
    if (!islandGroups[key]) islandGroups[key] = [];
    islandGroups[key].push(m);
  });
  Object.values(islandGroups).forEach(group => {
    [...group]
      .sort((a, b) => (rawMap[a.id] ?? 0) - (rawMap[b.id] ?? 0))
      .forEach((m, i) => { pctRank[m.id] = i + 1; });
  });

  if (mines.length === 0) return <p className="no-mines">Sem minas cadastradas.</p>;

  return (
    <div className="mines-table-wrap">
      <table className="mines-table">
        <colgroup>
          <col />
          <col />
          {showIsland && <col />}
          <col span={8} className="cg-a" />
          <col span={2} className="cg-b" />
          <col />
          <col />
          <col />
          {upgradeHints && <col />}
          {!readOnly && <col />}
        </colgroup>
        <thead>
          <tr>
            <th className="col-status" rowSpan={2}></th>
            <th className="col-nome"   rowSpan={2}>Mina</th>
            {showIsland && <th className="col-ilha" rowSpan={2}>Ilha</th>}
            <th colSpan={2} className="grp-a-l">Armazém</th>
            <th colSpan={2}>Elevador</th>
            <th colSpan={2}>Extração</th>
            <th className="col-prestige" rowSpan={2}>Prest.<br />Atual</th>
            <th className="col-prestige grp-a-r" rowSpan={2}>Prest.<br />Máx.</th>
            <th colSpan={2} className="grp-b-l grp-b-r">Próx. Prestígio</th>
            <th className="col-rank"     rowSpan={2}>Ordem<br />Prestígio</th>
            <th className="col-producao" rowSpan={2}>Produção</th>
            <th className="col-pct"     rowSpan={2}>%</th>
            {upgradeHints && <th className="col-target" rowSpan={2}>Target</th>}
            {!readOnly && <th className="col-action" rowSpan={2}></th>}
          </tr>
          <tr>
            <th className="col-nivel sub grp-a-l">Nível</th>
            <th className="col-letra sub">Letra</th>
            <th className="col-nivel sub">Nível</th>
            <th className="col-letra sub">Letra</th>
            <th className="col-nivel sub">Nível</th>
            <th className="col-letra sub">Letra</th>
            <th className="col-nivel sub grp-b-l">Valor</th>
            <th className="col-letra sub grp-b-r">Letra</th>
          </tr>
        </thead>
        <tbody>
          {mines.map(m => {
            const f = rows[m.id];
            if (!f) return null;
            const isSaving = saving[m.id] ?? false;
            const isSaved  = saved[m.id]  ?? false;
            const isDirty  = dirty[m.id]  ?? false;
            const status   = extracaoStatus(f, factors);
            const botleneck = minScore(f, factors);
            const producao = boosterTotal > 0 && botleneck
              ? boostedDisplay(botleneck.nivel, botleneck.letra, boosterTotal / 10, factors)
              : '—';
            const islandKey = m.island_id ?? 0;
            const islandTotal = islandRawTotals[islandKey] ?? 0;
            const pct = islandTotal > 0 && rawMap[m.id] > 0
              ? (rawMap[m.id] / islandTotal * 100).toFixed(2) + '%'
              : '—';
            const rank    = prestigeRank[m.id] ?? 0;
            const pctR    = pctRank[m.id] ?? 0;
            const rankDiff = rank > 0 && pctR > 0 ? Math.abs(rank - pctR) : -1;
            const rankBullet = rankDiff === -1 ? null
              : rankDiff === 0 ? 'bullet-green'
              : rankDiff === 1 ? 'bullet-warn'
              : 'bullet-red';

            const maxPrestige = m.prestigio_atual > 0 && m.prestigio_atual === m.prestigio_maximo;

            return (
              <tr key={m.id}>
                <td className="col-status">
                  <div className="col-status-inner">
                    {status !== 'unknown' && (
                      <span
                        className={`status-bullet ${status === 'min' ? 'bullet-green' : 'bullet-red'}`}
                        title={status === 'min' ? 'Extração é o gargalo' : 'Extração não é o gargalo'}
                      />
                    )}
                    {maxPrestige && <span className="prestige-star" title="Prestígio máximo atingido">★</span>}
                  </div>
                </td>

                <td className="col-nome">
                  {upgradeHints && <UpgradeArrow hint={upgradeHints[m.id] ?? null} />}
                  <span className="mine-name">{m.nome}</span>
                </td>

                {showIsland && (
                  <td className="col-ilha">
                    <span className="island-name-cell">{m.island_nome ?? '—'}</span>
                  </td>
                )}

                <td className="col-nivel grp-a-l">
                  {readOnly
                    ? <span>{f.armazem_nivel || '—'}</span>
                    : <input type="number" step="0.01" value={f.armazem_nivel}
                        onChange={e => set(m.id, 'armazem_nivel', e.target.value)} />}
                </td>
                <td className="col-letra">
                  {readOnly
                    ? <span>{f.armazem_letra || '—'}</span>
                    : <select value={f.armazem_letra}
                        onChange={e => set(m.id, 'armazem_letra', e.target.value)}>
                        <option value="">—</option>
                        {letras.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>}
                </td>

                <td className="col-nivel">
                  {readOnly
                    ? <span>{f.elevador_nivel || '—'}</span>
                    : <input type="number" step="0.01" value={f.elevador_nivel}
                        onChange={e => set(m.id, 'elevador_nivel', e.target.value)} />}
                </td>
                <td className="col-letra">
                  {readOnly
                    ? <span>{f.elevador_letra || '—'}</span>
                    : <select value={f.elevador_letra}
                        onChange={e => set(m.id, 'elevador_letra', e.target.value)}>
                        <option value="">—</option>
                        {letras.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>}
                </td>

                <td className="col-nivel">
                  {readOnly
                    ? <span>{f.extracao_nivel || '—'}</span>
                    : <input type="number" step="0.01" value={f.extracao_nivel}
                        onChange={e => set(m.id, 'extracao_nivel', e.target.value)} />}
                </td>
                <td className="col-letra">
                  {readOnly
                    ? <span>{f.extracao_letra || '—'}</span>
                    : <select value={f.extracao_letra}
                        onChange={e => set(m.id, 'extracao_letra', e.target.value)}>
                        <option value="">—</option>
                        {letras.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>}
                </td>

                <td className="col-prestige">
                  {readOnly
                    ? <span>{f.prestigio_atual || '—'}</span>
                    : <input type="number" min="0" value={f.prestigio_atual}
                        onChange={e => set(m.id, 'prestigio_atual', e.target.value)} />}
                </td>
                <td className="col-prestige grp-a-r">
                  {readOnly
                    ? <span>{f.prestigio_maximo || '—'}</span>
                    : <input type="number" min="0" value={f.prestigio_maximo}
                        onChange={e => set(m.id, 'prestigio_maximo', e.target.value)} />}
                </td>

                <td className="col-nivel grp-b-l">
                  {readOnly
                    ? <span>{f.proximo_prestigio_valor || '—'}</span>
                    : <input type="number" step="0.01" value={f.proximo_prestigio_valor}
                        onChange={e => set(m.id, 'proximo_prestigio_valor', e.target.value)} />}
                </td>
                <td className="col-letra grp-b-r">
                  {readOnly
                    ? <span>{f.proximo_prestigio_letra || '—'}</span>
                    : <select value={f.proximo_prestigio_letra}
                        onChange={e => set(m.id, 'proximo_prestigio_letra', e.target.value)}>
                        <option value="">—</option>
                        {letras.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>}
                </td>

                <td className="col-rank">
                  <div className="rank-cell">
                    {rankBullet && <span className={`status-bullet ${rankBullet}`} />}
                    {rank > 0 ? `#${rank}` : '—'}
                  </div>
                </td>
                <td className="col-producao">{producao}</td>
                <td className="col-pct">{pct}</td>
                {upgradeHints && (
                  <td className="col-target">
                    {upgradeHints[m.id] != null
                      ? formatRaw(upgradeHints[m.id]!.targetRaw * targetPct / 100, factors)
                      : '—'}
                  </td>
                )}

                {!readOnly && (
                  <td className="col-action">
                    <button
                      className={`btn-row-save ${isSaving ? '' : isSaved && !isDirty ? 'saved' : isDirty ? 'dirty' : ''}`}
                      onClick={() => handleSaveRow(m)}
                      disabled={isSaving || (!isDirty && !isSaved)}
                    >
                      {isSaving ? '…' : isSaved && !isDirty ? '✓' : 'Salvar'}
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
