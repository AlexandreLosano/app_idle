import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GameMode, Continent, Mine } from '../types';
import { api } from '../api/client';

interface Props {
  gameModes: GameMode[];
  onRefresh: () => void;
}

export function CadastrosPanel({ gameModes, onRefresh }: Props) {
  const { t } = useTranslation();
  const [continents, setContinents] = useState<Continent[]>([]);
  const [mines,      setMines]      = useState<Mine[]>([]);

  async function reloadContinents() {
    setContinents(await api.continents.list());
  }
  async function reloadMines() {
    setMines(await api.mines.list());
  }

  useEffect(() => {
    reloadContinents();
    reloadMines();
  }, []);

  /* ── Modos de Jogo (ex-Continentes) ────────────────────────────── */
  const [gmNome,      setGmNome]      = useState('');
  const [gmSaving,    setGmSaving]    = useState(false);
  const [selGmId,     setSelGmId]     = useState('');
  const [editGmNome,  setEditGmNome]  = useState('');
  const [gmEditSav,   setGmEditSav]   = useState(false);

  function onSelectGameMode(id: string) {
    setSelGmId(id);
    setEditGmNome(gameModes.find(gm => gm.id === Number(id))?.nome ?? '');
  }

  async function createGameMode(e: React.FormEvent) {
    e.preventDefault();
    if (!gmNome.trim()) return;
    setGmSaving(true);
    try {
      await api.gameModes.create(gmNome.trim());
      setGmNome('');
      onRefresh();
    } finally { setGmSaving(false); }
  }

  async function saveGameModeEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selGmId || !editGmNome.trim()) return;
    setGmEditSav(true);
    try {
      await api.gameModes.update(Number(selGmId), { nome: editGmNome.trim() });
      setSelGmId('');
      onRefresh();
    } finally { setGmEditSav(false); }
  }

  /* ── Continentes (ex-Ilhas) ─────────────────────────────────────── */
  const [cNome,          setCNome]          = useState('');
  const [cGameModeId,    setCGameModeId]    = useState('');
  const [cSaving,        setCSaving]        = useState(false);
  const [selContId,      setSelContId]      = useState('');
  const [editContNome,   setEditContNome]   = useState('');
  const [editContGmId,   setEditContGmId]   = useState('');
  const [contEditSav,    setContEditSav]    = useState(false);

  function onSelectCont(id: string) {
    setSelContId(id);
    const cont = continents.find(c => c.id === Number(id));
    setEditContNome(cont?.nome ?? '');
    setEditContGmId(cont?.game_mode_id?.toString() ?? '');
  }

  async function createContinent(e: React.FormEvent) {
    e.preventDefault();
    if (!cNome.trim() || !cGameModeId) return;
    setCSaving(true);
    try {
      await api.continents.create({ nome: cNome.trim(), game_mode_id: Number(cGameModeId) });
      setCNome('');
      await reloadContinents();
      onRefresh();
    } finally { setCSaving(false); }
  }

  async function saveContinentEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selContId) return;
    setContEditSav(true);
    try {
      await api.continents.update(Number(selContId), {
        nome:         editContNome.trim() || undefined,
        game_mode_id: editContGmId ? Number(editContGmId) : undefined,
      });
      setSelContId('');
      await reloadContinents();
      onRefresh();
    } finally { setContEditSav(false); }
  }

  /* ── Minas ──────────────────────────────────────────────────────── */
  const [mNome,          setMNome]          = useState('');
  const [mGameModeId,    setMGameModeId]    = useState('');
  const [mContinentId,   setMContinentId]   = useState('');
  const [mSaving,        setMSaving]        = useState(false);
  const [selMineNome,    setSelMineNome]    = useState('');
  const [editMNome,      setEditMNome]      = useState('');
  const [editMGameMode,  setEditMGameMode]  = useState('');
  const [editMCont,      setEditMCont]      = useState('');
  const [mineEditSav,    setMineEditSav]    = useState(false);

  function onSelectMine(nome: string) {
    setSelMineNome(nome);
    const m = mines.find(m => m.nome === nome);
    setEditMNome(m?.nome ?? '');
    const cont = continents.find(c => c.id === m?.continent_id);
    setEditMGameMode(cont?.game_mode_id?.toString() ?? '');
    setEditMCont(m?.continent_id?.toString() ?? '');
  }

  const continentsForCreate = mGameModeId
    ? continents.filter(c => c.game_mode_id === Number(mGameModeId))
    : continents;
  const continentsForEdit = editMGameMode
    ? continents.filter(c => c.game_mode_id === Number(editMGameMode))
    : continents;

  async function createMine(e: React.FormEvent) {
    e.preventDefault();
    if (!mNome.trim()) return;
    setMSaving(true);
    try {
      await api.mines.create({ nome: mNome.trim(), continent_id: mContinentId ? Number(mContinentId) : undefined });
      setMNome('');
      setMContinentId('');
      await reloadMines();
      onRefresh();
    } finally { setMSaving(false); }
  }

  async function saveMineEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selMineNome) return;
    setMineEditSav(true);
    try {
      await api.mines.update(selMineNome, {
        nome:         editMNome.trim() || undefined,
        continent_id: editMCont ? Number(editMCont) : undefined,
      });
      setSelMineNome('');
      await reloadMines();
      onRefresh();
    } finally { setMineEditSav(false); }
  }

  return (
    <section className="panel">
      <h2>{t('register.header')}</h2>
      <div className="cad-sections">

        {/* ── Modos de Jogo ───────────────────────────────────────── */}
        <div className="cad-section">
          <h3 className="cad-section-title">{t('register.game_modes')}</h3>

          <form className="cad-form" onSubmit={createGameMode}>
            <input
              className="cad-input"
              placeholder={t('register.game_mode_name')}
              value={gmNome}
              onChange={e => setGmNome(e.target.value)}
            />
            <button className="btn-save" type="submit" disabled={gmSaving || !gmNome.trim()}>
              {gmSaving ? '…' : t('common.create')}
            </button>
          </form>

          <div className="cad-edit-row">
            <select
              className="cad-select cad-select-wide"
              value={selGmId}
              onChange={e => onSelectGameMode(e.target.value)}
            >
              <option value="">{t('register.select_to_edit')}</option>
              {gameModes.map(gm => <option key={gm.id} value={gm.id}>{gm.nome}</option>)}
            </select>

            {selGmId && (
              <form className="cad-edit-form" onSubmit={saveGameModeEdit}>
                <input
                  className="cad-input"
                  value={editGmNome}
                  onChange={e => setEditGmNome(e.target.value)}
                />
                <button className="btn-save" type="submit" disabled={gmEditSav || !editGmNome.trim()}>
                  {gmEditSav ? '…' : t('common.save')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Continentes ─────────────────────────────────────────── */}
        <div className="cad-section">
          <h3 className="cad-section-title">{t('register.continents')}</h3>

          <form className="cad-form" onSubmit={createContinent}>
            <input
              className="cad-input"
              placeholder={t('register.continent_name')}
              value={cNome}
              onChange={e => setCNome(e.target.value)}
            />
            <select className="cad-select" value={cGameModeId} onChange={e => setCGameModeId(e.target.value)}>
              <option value="">{t('register.select_game_mode')}</option>
              {gameModes.map(gm => <option key={gm.id} value={gm.id}>{gm.nome}</option>)}
            </select>
            <button className="btn-save" type="submit" disabled={cSaving || !cNome.trim() || !cGameModeId}>
              {cSaving ? '…' : t('common.create')}
            </button>
          </form>

          <div className="cad-edit-row">
            <select
              className="cad-select cad-select-wide"
              value={selContId}
              onChange={e => onSelectCont(e.target.value)}
            >
              <option value="">{t('register.select_to_edit')}</option>
              {continents.map(c => {
                const gm = gameModes.find(gm => gm.id === c.game_mode_id);
                return (
                  <option key={c.id} value={c.id}>
                    {c.nome} — {gm?.nome ?? '?'}
                  </option>
                );
              })}
            </select>

            {selContId && (
              <form className="cad-edit-form" onSubmit={saveContinentEdit}>
                <input
                  className="cad-input"
                  value={editContNome}
                  onChange={e => setEditContNome(e.target.value)}
                />
                <select className="cad-select" value={editContGmId} onChange={e => setEditContGmId(e.target.value)}>
                  <option value="">{t('register.select_game_mode')}</option>
                  {gameModes.map(gm => <option key={gm.id} value={gm.id}>{gm.nome}</option>)}
                </select>
                <button className="btn-save" type="submit" disabled={contEditSav}>
                  {contEditSav ? '…' : t('common.save')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Minas ───────────────────────────────────────────────── */}
        <div className="cad-section">
          <h3 className="cad-section-title">{t('register.mines')}</h3>

          <form className="cad-form" onSubmit={createMine}>
            <input
              className="cad-input"
              placeholder={t('register.mine_name')}
              value={mNome}
              onChange={e => setMNome(e.target.value)}
            />
            <select
              className="cad-select"
              value={mGameModeId}
              onChange={e => { setMGameModeId(e.target.value); setMContinentId(''); }}
            >
              <option value="">{t('register.select_game_mode')}</option>
              {gameModes.map(gm => <option key={gm.id} value={gm.id}>{gm.nome}</option>)}
            </select>
            <select className="cad-select" value={mContinentId} onChange={e => setMContinentId(e.target.value)}>
              <option value="">{t('register.select_continent')}</option>
              {continentsForCreate.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <button className="btn-save" type="submit" disabled={mSaving || !mNome.trim()}>
              {mSaving ? '…' : t('common.create')}
            </button>
          </form>

          <div className="cad-edit-row">
            <select
              className="cad-select cad-select-wide"
              value={selMineNome}
              onChange={e => onSelectMine(e.target.value)}
            >
              <option value="">{t('register.select_to_edit')}</option>
              {mines.map(m => (
                <option key={m.id} value={m.nome}>
                  {m.nome}{m.continent_nome ? ` — ${m.continent_nome}` : ''}
                </option>
              ))}
            </select>

            {selMineNome && (
              <form className="cad-edit-form" onSubmit={saveMineEdit}>
                <input
                  className="cad-input"
                  value={editMNome}
                  onChange={e => setEditMNome(e.target.value)}
                />
                <select
                  className="cad-select"
                  value={editMGameMode}
                  onChange={e => { setEditMGameMode(e.target.value); setEditMCont(''); }}
                >
                  <option value="">{t('register.select_game_mode')}</option>
                  {gameModes.map(gm => <option key={gm.id} value={gm.id}>{gm.nome}</option>)}
                </select>
                <select className="cad-select" value={editMCont} onChange={e => setEditMCont(e.target.value)}>
                  <option value="">{t('register.select_continent')}</option>
                  {continentsForEdit.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <button className="btn-save" type="submit" disabled={mineEditSav}>
                  {mineEditSav ? '…' : t('common.save')}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
