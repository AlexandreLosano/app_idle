import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Mine, Continent, GameMode, Factor, Artefato } from '../types';
import { api } from '../api/client';
import { ContinentPanel } from './ContinentPanel';
import { ArtefatosPanel } from './ArtefatosPanel';
import { SummaryPanel } from './SummaryPanel';
import { CadastrosPanel } from './CadastrosPanel';
import { PromocaoPanel } from './PromocaoPanel';
import { ProducaoPanel } from './ProducaoPanel';
import { DetalheContinentePanel } from './DetalheContinentePanel';
import { LanguageSelector } from './LanguageSelector';

export function Dashboard() {
  const { t } = useTranslation();
  const [mines,      setMines]      = useState<Mine[]>([]);
  const [continents, setContinents] = useState<Continent[]>([]);
  const [factors,    setFactors]    = useState<Factor[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<'summary' | 'continents' | 'detalhe' | 'boosters' | 'producao' | 'promocao' | 'cadastros'>('summary');
  const [artefatos,   setArtefatos]   = useState<Artefato[]>([]);
  const [boosterCfg,  setBoosterCfg]  = useState<{ buster_anuncio: number | null; total_comprado: number | null; target_pct: number | null; mult_off: number | null; horas_sono: number | null }>({ buster_anuncio: null, total_comprado: null, target_pct: null, mult_off: null, horas_sono: null });
  const [targetPct,      setTargetPct]      = useState(10);
  const [targetPctSaved, setTargetPctSaved] = useState(false);

  const [gameModes,       setGameModes]       = useState<GameMode[]>([]);
  const [activeGameModeId, setActiveGameModeId] = useState<number | null>(null);

  // Load game modes once on mount; set first as active
  useEffect(() => {
    api.gameModes.list()
      .then(gms => {
        setGameModes(gms);
        if (gms.length > 0) setActiveGameModeId(gms[0].id);
      })
      .catch(e => setError((e as Error).message));
  }, []);

  const load = useCallback(async () => {
    if (activeGameModeId === null) return;
    setLoading(true);
    setError(null);
    try {
      const [m, c, f, art, cfg] = await Promise.all([
        api.mines.list(undefined, activeGameModeId),
        api.continents.list(activeGameModeId),
        api.factors(),
        api.artefatos.list(),
        api.artefatos.getConfig(),
      ]);
      setMines(m);
      setContinents(c);
      setFactors(f);
      setArtefatos(art);
      setBoosterCfg(cfg ?? { buster_anuncio: null, total_comprado: null, target_pct: null, mult_off: null, horas_sono: null });
      if (cfg?.target_pct != null) setTargetPct(cfg.target_pct);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [activeGameModeId]);

  useEffect(() => { load(); }, [load]);

  // Reloads game modes list + main data; passed to CadastrosPanel
  const handleRefresh = useCallback(async () => {
    const gms = await api.gameModes.list();
    setGameModes(gms);
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
            className="game-mode-select"
            value={activeGameModeId ?? ''}
            onChange={e => setActiveGameModeId(Number(e.target.value))}
          >
            {gameModes.map(gm => (
              <option key={gm.id} value={gm.id}>{gm.nome}</option>
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
          className={activeTab === 'continents' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('continents')}
        >
          {t('dashboard.tabs.continents', { count: continents.length })}
        </button>
        <button
          className={activeTab === 'detalhe' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('detalhe')}
        >
          Detalhe Continente
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
          continents={continents}
          mines={mines}
          factors={factors}
          boosterTotal={boosterTotal}
          boosterInfo={boosterInfo}
        />
      )}

      {activeTab === 'continents' && (
        <ContinentPanel
          continents={continents}
          mines={mines}
          factors={factors}
          boosterTotal={boosterTotal}
          boosterInfo={boosterInfo}
          targetPct={targetPct}
          onMineUpdate={handleMineUpdate}
        />
      )}

      {activeTab === 'detalhe' && (
        <DetalheContinentePanel
          continents={continents}
          mines={mines}
          factors={factors}
          boosterTotal={boosterTotal}
        />
      )}

      {activeTab === 'boosters' && (
        <>
          <ArtefatosPanel
            artefatos={artefatos}
            onUpdate={updated => setArtefatos(arr => arr.map(a => a.id === updated.id ? updated : a))}
            onAdd={created => setArtefatos(arr => [...arr, created].sort((a, b) => a.quantidade - b.quantidade))}
            onConfigChange={partial => setBoosterCfg(prev => ({ ...prev, ...partial }))}
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
          continents={continents}
          mines={mines}
          factors={factors}
          boosterTotal={boosterTotal}
          multOff={boosterCfg.mult_off}
          horasSonoInit={boosterCfg.horas_sono}
        />
      )}

      {activeTab === 'promocao' && (
        <PromocaoPanel
          continents={continents}
          mines={mines}
          factors={factors}
          artefatos={artefatos}
          boosterCfg={boosterCfg}
          boosterTotal={boosterTotal}
        />
      )}

      {activeTab === 'cadastros' && (
        <CadastrosPanel
          gameModes={gameModes}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
