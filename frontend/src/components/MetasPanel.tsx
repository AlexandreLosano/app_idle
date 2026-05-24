import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Continent, Mine, Factor, Meta } from '../types';
import { api } from '../api/client';
import { computeProduction, minNextPrestige } from '../utils/gameCalc';
import { formatRaw } from '../utils/upgradeAdvisor';

interface Props {
  continents: Continent[];
  mines: Mine[];
  factors: Factor[];
  boosterTotal: number;
  metas: Meta[];
  onMetaUpdate: (updated: Meta) => void;
}

type MetaForm = { valor: string; letra: string; unidade: 's' | 'min' | 'd' };

export function MetasPanel({ continents, mines, factors, boosterTotal, metas, onMetaUpdate }: Props) {
  const { t } = useTranslation();

  const [forms,  setForms]  = useState<Record<number, MetaForm>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved,  setSaved]  = useState<Record<number, boolean>>({});
  const [dirty,  setDirty]  = useState<Record<number, boolean>>({});

  // Calculadora
  const [calcValor,   setCalcValor]   = useState('');
  const [calcLetra,   setCalcLetra]   = useState('');
  const [calcTempo,   setCalcTempo]   = useState('');
  const [calcUnidade, setCalcUnidade] = useState<'s' | 'min' | 'h' | 'd'>('d');

  useEffect(() => {
    setForms(prev => {
      const next = { ...prev };
      for (const m of metas) {
        if (!dirty[m.continent_id]) {
          next[m.continent_id] = { valor: String(m.valor), letra: m.letra, unidade: m.unidade ?? 's' };
        }
      }
      return next;
    });
  }, [metas]);

  const sortedFactors = [...factors].sort((a, b) => a.cont - b.cont);

  async function handleSave(continent_id: number, f: MetaForm) {
    if (!f?.valor || !f.letra) return;
    setSaving(s => ({ ...s, [continent_id]: true }));
    try {
      const updated = await api.metas.update(continent_id, {
        valor: parseFloat(f.valor),
        letra: f.letra,
        unidade: f.unidade,
      });
      onMetaUpdate(updated);
      setSaved(s => ({ ...s, [continent_id]: true }));
      setDirty(d => ({ ...d, [continent_id]: false }));
    } finally {
      setSaving(s => ({ ...s, [continent_id]: false }));
    }
  }

  function setUnidade(continent_id: number, value: 's' | 'min' | 'd') {
    setForms(f => ({ ...f, [continent_id]: { ...f[continent_id], unidade: value } }));
    setSaved(s => ({ ...s, [continent_id]: false }));
    setDirty(d => ({ ...d, [continent_id]: true }));
  }

  function setFormField(continent_id: number, field: keyof MetaForm, value: string) {
    setForms(f => ({ ...f, [continent_id]: { ...f[continent_id], [field]: value } }));
    setSaved(s => ({ ...s, [continent_id]: false }));
    setDirty(d => ({ ...d, [continent_id]: true }));
  }

  // Resultado da calculadora
  const calcResult = (() => {
    if (!calcValor || !calcLetra || !calcTempo) return null;
    const cont = factors.find(f => f.letra === calcLetra)?.cont ?? 1;
    const qtdRaw = parseFloat(calcValor) * Math.pow(1000, cont - 1);
    const multMap = { s: 1, min: 60, h: 3600, d: 86400 };
    const tempoSeg = parseFloat(calcTempo) * multMap[calcUnidade];
    if (!isFinite(tempoSeg) || tempoSeg <= 0 || !isFinite(qtdRaw) || qtdRaw <= 0) return null;
    return qtdRaw / tempoSeg;
  })();

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{t('metas.header')}</h2>
      </div>

      <div className="metas-table-wrap">
        <table className="metas-table">
          <thead>
            <tr>
              <th>{t('metas.col_continent')}</th>
              <th>{t('metas.col_production')}</th>
              <th>{t('metas.col_next_prestige')}</th>
              <th>{t('metas.col_meta')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {continents.map(continent => {
              const continentMines = mines.filter(m => m.continent_id === continent.id);
              const production   = computeProduction(continentMines, factors, boosterTotal / 10);
              const nextPrestige = minNextPrestige(continentMines, factors);

              const form = forms[continent.id] ?? {
                valor:   '',
                letra:   sortedFactors[0]?.letra ?? '',
                unidade: 's' as const,
              };

              const isSaving = saving[continent.id] ?? false;
              const isSaved  = saved[continent.id]  ?? false;
              const isDirty  = dirty[continent.id]  ?? false;

              return (
                <tr key={continent.id}>
                  <td className="metas-col-name">{continent.nome}</td>
                  <td className="metas-col-prod"><span className="prod-value">{production.display}</span></td>
                  <td className="metas-col-prestige">
                    {nextPrestige.raw > 0 ? nextPrestige.display : '—'}
                  </td>
                  <td className="metas-col-meta">
                    <span className="metas-meta-edit">
                      <input
                        type="number"
                        className="meta-valor-input"
                        value={form.valor}
                        min={0}
                        onChange={e => setFormField(continent.id, 'valor', e.target.value)}
                      />
                      <select
                        className="meta-letra-select"
                        value={form.letra}
                        onChange={e => setFormField(continent.id, 'letra', e.target.value)}
                      >
                        {sortedFactors.map(f => (
                          <option key={f.letra} value={f.letra}>{f.letra}</option>
                        ))}
                      </select>
                      <span className="metas-unit-group">
                        {(['s', 'min', 'd'] as const).map(u => (
                          <button
                            key={u}
                            className={`metas-unit-btn${form.unidade === u ? ' active' : ''}`}
                            onClick={() => setUnidade(continent.id, u)}
                            title={u === 's' ? t('metas.unit_seconds') : u === 'min' ? t('metas.unit_minutes') : t('metas.unit_days')}
                          >
                            /{u}
                          </button>
                        ))}
                      </span>
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn-row-save${isSaved && !isDirty ? ' saved' : isDirty ? ' dirty' : ''}`}
                      onClick={() => handleSave(continent.id, form)}
                      disabled={isSaving || !form.valor || !form.letra}
                    >
                      {isSaved && !isDirty ? t('common.saved') : t('common.save')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="metas-calc">
        <h3>{t('metas.calc_header')}</h3>
        <div className="metas-calc-row">
          <span className="metas-calc-label">{t('metas.calc_quantity')}</span>
          <input
            type="number"
            className="meta-valor-input"
            placeholder="ex: 5"
            value={calcValor}
            min={0}
            onChange={e => setCalcValor(e.target.value)}
          />
          <select
            className="meta-letra-select"
            value={calcLetra}
            onChange={e => setCalcLetra(e.target.value)}
          >
            <option value="">—</option>
            {sortedFactors.map(f => (
              <option key={f.letra} value={f.letra}>{f.letra}</option>
            ))}
          </select>
        </div>
        <div className="metas-calc-row">
          <span className="metas-calc-label">{t('metas.calc_time')}</span>
          <input
            type="number"
            className="meta-valor-input"
            placeholder="ex: 7"
            value={calcTempo}
            min={0}
            onChange={e => setCalcTempo(e.target.value)}
          />
          <select
            className="meta-letra-select"
            value={calcUnidade}
            onChange={e => setCalcUnidade(e.target.value as 's' | 'min' | 'h' | 'd')}
          >
            <option value="s">{t('metas.unit_seconds')}</option>
            <option value="min">{t('metas.unit_minutes')}</option>
            <option value="h">{t('metas.unit_hours')}</option>
            <option value="d">{t('metas.unit_days')}</option>
          </select>
        </div>
        <div className="metas-calc-row">
          <span className="metas-calc-label">{t('metas.calc_result')}</span>
          <span className="metas-calc-result">
            {calcResult != null ? `${formatRaw(calcResult, factors)}/s` : '—'}
          </span>
        </div>
      </div>
    </section>
  );
}
