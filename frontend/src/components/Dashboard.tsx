import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Mine, Island, Factor, Artefato, Continent } from '../types';
import { api } from '../api/client';
import { IslandPanel } from './IslandPanel';
import { ArtefatosPanel } from './ArtefatosPanel';
import { SummaryPanel } from './SummaryPanel';
import { CadastrosPanel } from './CadastrosPanel';
import { PromocaoPanel } from './PromocaoPanel';
import { ProducaoPanel } from './ProducaoPanel';
import { LanguageSelector } from './LanguageSelector';

export function Dashboard() {
  const { t } = useTranslation();
  const [mines, setMines]       = useState<Mine[]>([]);
  const [islands, setIslands]   = useState<Island[]>([]);
  const [factors, setFactors]   = useState<Factor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'islands' | 'boosters' | 'producao' | 'promocao' | 'cadastros'>('summary');
  const [artefatos, setArtefatos] = useState<Artefato[]>([]);
  const [boosterCfg, setBoosterCfg] = useState<{ buster_anuncio: number | null; total_comprado: number | null; target_pct: number | null; mult_off: number | null; horas_sono: number | null }>({ buster_anuncio: null, total_comprado: null, target_pct: null, mult_off: null, horas_sono: null });
  const [targetPct, setTargetPct] = useState(10);
  const [targetPctSaved, setTargetPctSaved] = useState(false);

  const [continents, setContinents]           = useState<Continent[]>([]);
  const [activeContinentId, setActiveContinentId] = useState<number | null>(null);

  // Load continents once on mount; set first as active
  useEffect(() => {
    api.continents.list()
      .then(cs => {
        setContinents(cs);
        if (cs.length > 0) setActiveContinentId(cs[0].id);
      })
      .catch(e => setError((e as Error).message));
  }, []);

  const load = useCallback(async () => {
    if (activeContinentId === null) return;
    setLoading(true);
    setError(null);
    try {
      const [m, i, f, art, cfg] = await Promise.all([
        api.mines.list(undefined, activeContinentId),
        api.islands.list(activeContinentId),
        api.factors(),
        api.artefatos.list(),
        api.artefatos.getConfig(),
      ]);
      setMines(m);
      setIslands(i);
      setFactors(f);
      setArtefatos(art);
      setBoosterCfg(cfg ?? { buster_anuncio: null, total_comprado: null, target_pct: null, mult_off: null, horas_sono: null });
      if (cfg?.target_pct != null) setTargetPct(cfg.target_pct);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [activeContinentId]);

  useEffect(() => { load(); }, [load]);

  // Reloads continents list + main data; passed to CadastrosPanel
  const handleRefresh = useCallback(async () => {
    const cs = await api.continents.list();
    setContinents(cs);
    await load();
  }, [load]);

  const handleMineUpdate = (updated: Mine) =>
    setMines(ms => ms.map(m => m.id === updated.id ? updated : m));

  const artefatosAtivos = artefatos.filter(a => a.ativo);
  const somaOff = artefatosAtivos.reduce((acc, a) => acc + a.quantidade, 0);
  const boosterTotal = Math.round((somaOff + (boosterCfg.total_comprado ?? 0)) * (boosterCfg.buster_anuncio ?? 0) * 10) / 10;
  const boosterInfo = {
    somaOff,
    artefatosAtivos: artefatosAtivos.length,
    totalComprado: boosterCfg.total_comprado ?? 0,
    busterAnuncio: boosterCfg.buster_anuncio ?? 0,
    total: boosterTotal,
  };

  if (loading) return <div className="loading">{t('common.loading')}</div>;
  if (error) return <div className="error">{t('common.error')}: {error} <button onClick={load}>{t('common.retry')}</button></div>;

  return (
    <div className="dashboard">
      <header className="app-header">
        <h1>{t('dashboard.title')}</h1>
        <div className="header-controls">
          <select
            className="continent-select"
            value={activeContinentId ?? ''}
            onChange={e => setActiveContinentId(Number(e.target.value))}
          >
            {continents.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <LanguageSelector />
        </div>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'summary' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('summary')}
        >
          {t('dashboard.tabs.summary')}
        </button>
        <button
          className={activeTab === 'islands' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('islands')}
        >
          {t('dashboard.tabs.islands', { count: islands.length })}
        </button>
        <button
          className={activeTab === 'boosters' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('boosters')}
        >
          {t('dashboard.tabs.boosters')}
        </button>
        <button
          className={activeTab === 'producao' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('producao')}
        >
          {t('dashboard.tabs.production')}
        </button>
        <button
          className={activeTab === 'promocao' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('promocao')}
        >
          {t('dashboard.tabs.promotion')}
        </button>
        <button
          className={activeTab === 'cadastros' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('cadastros')}
        >
          {t('dashboard.tabs.register')}
        </button>
      </nav>

      {activeTab === 'summary' && (
        <SummaryPanel
          islands={islands}
          mines={mines}
          factors={factors}
          boosterTotal={boosterTotal}
          boosterInfo={boosterInfo}
        />
      )}

      {activeTab === 'islands' && (
        <IslandPanel
          islands={islands}
          mines={mines}
          factors={factors}
          boosterTotal={boosterTotal}
          boosterInfo={boosterInfo}
          targetPct={targetPct}
          onMineUpdate={handleMineUpdate}
        />
      )}

      {activeTab === 'boosters' && (
        <>
          <ArtefatosPanel
            artefatos={artefatos}
            onUpdate={updated => setArtefatos(arr => arr.map(a => a.id === updated.id ? updated : a))}
            onAdd={created => setArtefatos(arr => [...arr, created].sort((a, b) => a.quantidade - b.quantidade))}
          />
          <div className="target-pct-bar">
            <span className="target-pct-label">
              {t('prestige.target_label')} <strong>{targetPct}%</strong>
            </span>
            <input
              type="range"
              className="target-pct-slider"
              min={1}
              max={100}
              step={1}
              value={targetPct}
              onChange={e => { setTargetPct(Number(e.target.value)); setTargetPctSaved(false); }}
            />
            <button
              className={`btn-row-save${targetPctSaved ? ' saved' : ''}`}
              onClick={async () => {
                await api.artefatos.updateConfig({ target_pct: targetPct });
                setTargetPctSaved(true);
              }}
            >
              {targetPctSaved ? t('common.saved') : t('common.save')}
            </button>
          </div>
        </>
      )}

      {activeTab === 'producao' && (
        <ProducaoPanel
          islands={islands}
          mines={mines}
          factors={factors}
          boosterTotal={boosterTotal}
          multOff={boosterCfg.mult_off}
          horasSonoInit={boosterCfg.horas_sono}
        />
      )}

      {activeTab === 'promocao' && (
        <PromocaoPanel
          islands={islands}
          mines={mines}
          factors={factors}
          artefatos={artefatos}
          boosterCfg={boosterCfg}
          boosterTotal={boosterTotal}
        />
      )}

      {activeTab === 'cadastros' && (
        <CadastrosPanel
          continents={continents}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
