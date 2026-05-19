import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Artefato } from '../types';
import { api } from '../api/client';

interface Props {
  artefatos: Artefato[];
  onUpdate: (updated: Artefato) => void;
  onAdd: (created: Artefato) => void;
}

function fmtQtd(n: number): string {
  return n >= 1000 ? n.toLocaleString('pt-BR') : String(n);
}

export function ArtefatosPanel({ artefatos, onUpdate, onAdd }: Props) {
  const { t } = useTranslation();
  const [busterAnuncio, setBusterAnuncio] = useState<string>('');
  const [totalComprado, setTotalComprado] = useState<string>('');
  const [adding, setAdding] = useState(false);
  const [newQtd, setNewQtd] = useState<string>('');
  const [newTipo, setNewTipo] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const qtdRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.artefatos.getConfig().then(c => {
      setBusterAnuncio(c?.buster_anuncio?.toString() ?? '');
      setTotalComprado(c?.total_comprado?.toString() ?? '');
    });
  }, []);

  useEffect(() => {
    if (adding) qtdRef.current?.focus();
  }, [adding]);

  async function toggle(a: Artefato) {
    const updated = await api.artefatos.update(a.id, { ativo: !a.ativo });
    onUpdate(updated);
  }

  async function saveConfig(field: 'buster_anuncio' | 'total_comprado', raw: string) {
    const val = raw.trim() === '' ? null : parseFloat(raw);
    await api.artefatos.updateConfig({ [field]: val });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const qtd = parseFloat(newQtd);
    if (!qtd || qtd <= 0) return;
    setSaving(true);
    try {
      const created = await api.artefatos.create({ quantidade: qtd, tipo: newTipo.trim() || t('boosters.by_time') });
      onAdd(created);
      setNewQtd('');
      setNewTipo('');
      setAdding(false);
    } finally {
      setSaving(false);
    }
  }

  function cancelAdd() {
    setAdding(false);
    setNewQtd('');
    setNewTipo('');
  }

  const sorted = [...artefatos].sort((a, b) => a.quantidade - b.quantidade);

  const somaOff     = sorted.filter(a => a.ativo).reduce((acc, a) => acc + a.quantidade, 0);
  const busterVal   = parseFloat(busterAnuncio) || 0;
  const compradoVal = parseFloat(totalComprado) || 0;
  const total       = Math.round((somaOff + compradoVal) * busterVal * 10) / 10;

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{t('boosters.header')}</h2>
        {!adding && (
          <button className="btn-add-artefato" onClick={() => setAdding(true)}>{t('common.new')}</button>
        )}
      </div>

      {adding && (
        <form className="artefato-add-form" onSubmit={handleCreate}>
          <input
            ref={qtdRef}
            className="config-input"
            type="number"
            min="1"
            step="1"
            placeholder={t('boosters.quantity')}
            value={newQtd}
            onChange={e => setNewQtd(e.target.value)}
          />
          <input
            className="config-input artefato-tipo-input"
            type="text"
            placeholder={t('boosters.by_time')}
            value={newTipo}
            onChange={e => setNewTipo(e.target.value)}
          />
          <button className="btn-save" type="submit" disabled={saving}>
            {saving ? '…' : t('common.save')}
          </button>
          <button className="btn-cancel" type="button" onClick={cancelAdd}>{t('common.cancel')}</button>
        </form>
      )}

      <div className="boosters-layout">

        <div className="artefatos-grid">
          {sorted.map(a => (
            <button
              key={a.id}
              className={`artefato-card ${a.ativo ? 'ativo' : ''}`}
              onClick={() => toggle(a)}
              title={a.ativo ? t('boosters.click_deactivate') : t('boosters.click_activate')}
            >
              <span className="artefato-qtd">{fmtQtd(a.quantidade)}</span>
              <span className="artefato-tipo">{a.tipo}</span>
              <span className="artefato-badge">{a.ativo ? '✓' : ''}</span>
            </button>
          ))}
        </div>

        <div className="booster-config">
          <p className="config-section-title">{t('boosters.multipliers')}</p>

          <div className="config-row">
            <span className="config-label">{t('boosters.soma_off')}</span>
            <span className="config-value">{somaOff}</span>
          </div>

          <div className="config-row">
            <span className="config-label">{t('boosters.ad_booster')}</span>
            <input
              className="config-input"
              type="number"
              step="0.01"
              value={busterAnuncio}
              onChange={e => setBusterAnuncio(e.target.value)}
              onBlur={() => saveConfig('buster_anuncio', busterAnuncio)}
              placeholder="—"
            />
          </div>

          <div className="config-row">
            <span className="config-label">{t('boosters.total_purchased')}</span>
            <input
              className="config-input"
              type="number"
              step="0.01"
              value={totalComprado}
              onChange={e => setTotalComprado(e.target.value)}
              onBlur={() => saveConfig('total_comprado', totalComprado)}
              placeholder="—"
            />
          </div>

          <div className="config-divider" />

          <div className="config-row">
            <span className="config-label">{t('boosters.total')}</span>
            <span className="config-total-value">
              {total.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
