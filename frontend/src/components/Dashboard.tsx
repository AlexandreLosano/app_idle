import { useEffect, useState, useCallback } from 'react';
import type { Mine, Island, Factor, Artefato } from '../types';
import { api } from '../api/client';
import { MinesTable } from './MinesTable';
import { IslandPanel } from './IslandPanel';
import { ArtefatosPanel } from './ArtefatosPanel';
import { SummaryPanel } from './SummaryPanel';

export function Dashboard() {
  const [mines, setMines] = useState<Mine[]>([]);
  const [islands, setIslands] = useState<Island[]>([]);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'islands' | 'mines' | 'boosters'>('summary');
  const [artefatos, setArtefatos] = useState<Artefato[]>([]);
  const [boosterCfg, setBoosterCfg] = useState<{ buster_anuncio: number | null; total_comprado: number | null }>({ buster_anuncio: null, total_comprado: null });
  const [islandFilter, setIslandFilter] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, i, f, art, cfg] = await Promise.all([
        api.mines.list(),
        api.islands.list(),
        api.factors(),
        api.artefatos.list(),
        api.artefatos.getConfig(),
      ]);
      setMines(m);
      setIslands(i);
      setFactors(f);
      setArtefatos(art);
      setBoosterCfg(cfg ?? { buster_anuncio: null, total_comprado: null });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const filteredMines = islandFilter
    ? mines.filter(m => m.island_id?.toString() === islandFilter)
    : mines;

  if (loading) return <div className="loading">Carregando…</div>;
  if (error) return <div className="error">Erro: {error} <button onClick={load}>Tentar novamente</button></div>;

  return (
    <div className="dashboard">
      <header className="app-header">
        <h1>Idle Tracker</h1>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'summary' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('summary')}
        >
          Resumo
        </button>
        <button
          className={activeTab === 'islands' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('islands')}
        >
          Ilhas ({islands.length})
        </button>
        <button
          className={activeTab === 'mines' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('mines')}
        >
          Minas ({mines.length})
        </button>
        <button
          className={activeTab === 'boosters' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('boosters')}
        >
          Boosters / Artefatos
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
          onMineUpdate={handleMineUpdate}
        />
      )}

      {activeTab === 'boosters' && (
        <ArtefatosPanel
          artefatos={artefatos}
          onUpdate={updated => setArtefatos(arr => arr.map(a => a.id === updated.id ? updated : a))}
          onAdd={created => setArtefatos(arr => [...arr, created].sort((a, b) => a.quantidade - b.quantidade))}
        />
      )}

      {activeTab === 'mines' && (
        <section className="panel">
          <div className="panel-header">
            <h2>Minas</h2>
            <select
              className="island-filter"
              value={islandFilter}
              onChange={e => setIslandFilter(e.target.value)}
            >
              <option value="">Todas as ilhas</option>
              {islands.map(i => (
                <option key={i.id} value={i.id}>{i.nome}</option>
              ))}
            </select>
          </div>
          <MinesTable
            mines={filteredMines}
            factors={factors}
            islands={islands}
            showIsland={true}
            boosterTotal={boosterTotal}
            readOnly={true}
            onUpdate={handleMineUpdate}
          />
        </section>
      )}
    </div>
  );
}
