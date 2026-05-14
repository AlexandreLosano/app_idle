import { useEffect, useState } from 'react';
import type { Continent, Island, Mine } from '../types';
import { api } from '../api/client';

interface Props {
  continents: Continent[];
  onRefresh: () => void;
}

export function CadastrosPanel({ continents, onRefresh }: Props) {
  const [islands, setIslands] = useState<Island[]>([]);
  const [mines,   setMines]   = useState<Mine[]>([]);

  async function reloadIslands() {
    setIslands(await api.islands.list());
  }
  async function reloadMines() {
    setMines(await api.mines.list());
  }

  useEffect(() => {
    reloadIslands();
    reloadMines();
  }, []);

  /* ── Continentes ────────────────────────────────────────────────── */
  const [contNome,      setContNome]      = useState('');
  const [contSaving,    setContSaving]    = useState(false);
  const [selContId,     setSelContId]     = useState('');
  const [editContNome,  setEditContNome]  = useState('');
  const [contEditSav,   setContEditSav]   = useState(false);

  function onSelectCont(id: string) {
    setSelContId(id);
    setEditContNome(continents.find(c => c.id === Number(id))?.nome ?? '');
  }

  async function createContinent(e: React.FormEvent) {
    e.preventDefault();
    if (!contNome.trim()) return;
    setContSaving(true);
    try {
      await api.continents.create(contNome.trim());
      setContNome('');
      onRefresh();
    } finally { setContSaving(false); }
  }

  async function saveContEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selContId || !editContNome.trim()) return;
    setContEditSav(true);
    try {
      await api.continents.update(Number(selContId), { nome: editContNome.trim() });
      setSelContId('');
      onRefresh();
    } finally { setContEditSav(false); }
  }

  /* ── Ilhas ──────────────────────────────────────────────────────── */
  const [iNome,        setINome]        = useState('');
  const [iContId,      setIContId]      = useState('');
  const [iSaving,      setISaving]      = useState(false);
  const [selIslId,     setSelIslId]     = useState('');
  const [editIslNome,  setEditIslNome]  = useState('');
  const [editIslCont,  setEditIslCont]  = useState('');
  const [islEditSav,   setIslEditSav]   = useState(false);

  function onSelectIsl(id: string) {
    setSelIslId(id);
    const isl = islands.find(i => i.id === Number(id));
    setEditIslNome(isl?.nome ?? '');
    setEditIslCont(isl?.continent_id?.toString() ?? '');
  }

  async function createIsland(e: React.FormEvent) {
    e.preventDefault();
    if (!iNome.trim() || !iContId) return;
    setISaving(true);
    try {
      await api.islands.create({ nome: iNome.trim(), continent_id: Number(iContId) });
      setINome('');
      await reloadIslands();
      onRefresh();
    } finally { setISaving(false); }
  }

  async function saveIslandEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selIslId) return;
    setIslEditSav(true);
    try {
      await api.islands.update(Number(selIslId), {
        nome:         editIslNome.trim() || undefined,
        continent_id: editIslCont ? Number(editIslCont) : undefined,
      });
      setSelIslId('');
      await reloadIslands();
      onRefresh();
    } finally { setIslEditSav(false); }
  }

  /* ── Minas ──────────────────────────────────────────────────────── */
  const [mNome,       setMNome]       = useState('');
  const [mContId,     setMContId]     = useState('');
  const [mIslandId,   setMIslandId]   = useState('');
  const [mSaving,     setMSaving]     = useState(false);
  const [selMineNome, setSelMineNome] = useState('');
  const [editMNome,   setEditMNome]   = useState('');
  const [editMCont,   setEditMCont]   = useState('');
  const [editMIsl,    setEditMIsl]    = useState('');
  const [mineEditSav, setMineEditSav] = useState(false);

  function onSelectMine(nome: string) {
    setSelMineNome(nome);
    const m = mines.find(m => m.nome === nome);
    setEditMNome(m?.nome ?? '');
    const isl = islands.find(i => i.id === m?.island_id);
    setEditMCont(isl?.continent_id?.toString() ?? '');
    setEditMIsl(m?.island_id?.toString() ?? '');
  }

  const islandsForCreate = mContId
    ? islands.filter(i => i.continent_id === Number(mContId))
    : islands;
  const islandsForEdit = editMCont
    ? islands.filter(i => i.continent_id === Number(editMCont))
    : islands;

  async function createMine(e: React.FormEvent) {
    e.preventDefault();
    if (!mNome.trim()) return;
    setMSaving(true);
    try {
      await api.mines.create({ nome: mNome.trim(), island_id: mIslandId ? Number(mIslandId) : undefined });
      setMNome('');
      setMIslandId('');
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
        nome:      editMNome.trim() || undefined,
        island_id: editMIsl ? Number(editMIsl) : undefined,
      });
      setSelMineNome('');
      await reloadMines();
      onRefresh();
    } finally { setMineEditSav(false); }
  }

  return (
    <section className="panel">
      <h2>Cadastros</h2>
      <div className="cad-sections">

        {/* ── Continentes ─────────────────────────────────────────── */}
        <div className="cad-section">
          <h3 className="cad-section-title">Continentes</h3>

          <form className="cad-form" onSubmit={createContinent}>
            <input
              className="cad-input"
              placeholder="Nome do continente"
              value={contNome}
              onChange={e => setContNome(e.target.value)}
            />
            <button className="btn-save" type="submit" disabled={contSaving || !contNome.trim()}>
              {contSaving ? '…' : 'Criar'}
            </button>
          </form>

          <div className="cad-edit-row">
            <select
              className="cad-select cad-select-wide"
              value={selContId}
              onChange={e => onSelectCont(e.target.value)}
            >
              <option value="">Selecione para editar…</option>
              {continents.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>

            {selContId && (
              <form className="cad-edit-form" onSubmit={saveContEdit}>
                <input
                  className="cad-input"
                  value={editContNome}
                  onChange={e => setEditContNome(e.target.value)}
                />
                <button className="btn-save" type="submit" disabled={contEditSav || !editContNome.trim()}>
                  {contEditSav ? '…' : 'Salvar'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Ilhas ───────────────────────────────────────────────── */}
        <div className="cad-section">
          <h3 className="cad-section-title">Ilhas</h3>

          <form className="cad-form" onSubmit={createIsland}>
            <input
              className="cad-input"
              placeholder="Nome da ilha"
              value={iNome}
              onChange={e => setINome(e.target.value)}
            />
            <select className="cad-select" value={iContId} onChange={e => setIContId(e.target.value)}>
              <option value="">Continente…</option>
              {continents.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <button className="btn-save" type="submit" disabled={iSaving || !iNome.trim() || !iContId}>
              {iSaving ? '…' : 'Criar'}
            </button>
          </form>

          <div className="cad-edit-row">
            <select
              className="cad-select cad-select-wide"
              value={selIslId}
              onChange={e => onSelectIsl(e.target.value)}
            >
              <option value="">Selecione para editar…</option>
              {islands.map(i => {
                const cont = continents.find(c => c.id === i.continent_id);
                return (
                  <option key={i.id} value={i.id}>
                    {i.nome} — {cont?.nome ?? '?'}
                  </option>
                );
              })}
            </select>

            {selIslId && (
              <form className="cad-edit-form" onSubmit={saveIslandEdit}>
                <input
                  className="cad-input"
                  value={editIslNome}
                  onChange={e => setEditIslNome(e.target.value)}
                />
                <select className="cad-select" value={editIslCont} onChange={e => setEditIslCont(e.target.value)}>
                  <option value="">Continente…</option>
                  {continents.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <button className="btn-save" type="submit" disabled={islEditSav}>
                  {islEditSav ? '…' : 'Salvar'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Minas ───────────────────────────────────────────────── */}
        <div className="cad-section">
          <h3 className="cad-section-title">Minas</h3>

          <form className="cad-form" onSubmit={createMine}>
            <input
              className="cad-input"
              placeholder="Nome da mina"
              value={mNome}
              onChange={e => setMNome(e.target.value)}
            />
            <select
              className="cad-select"
              value={mContId}
              onChange={e => { setMContId(e.target.value); setMIslandId(''); }}
            >
              <option value="">Continente…</option>
              {continents.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select className="cad-select" value={mIslandId} onChange={e => setMIslandId(e.target.value)}>
              <option value="">Ilha…</option>
              {islandsForCreate.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
            <button className="btn-save" type="submit" disabled={mSaving || !mNome.trim()}>
              {mSaving ? '…' : 'Criar'}
            </button>
          </form>

          <div className="cad-edit-row">
            <select
              className="cad-select cad-select-wide"
              value={selMineNome}
              onChange={e => onSelectMine(e.target.value)}
            >
              <option value="">Selecione para editar…</option>
              {mines.map(m => (
                <option key={m.id} value={m.nome}>
                  {m.nome}{m.island_nome ? ` — ${m.island_nome}` : ''}
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
                  value={editMCont}
                  onChange={e => { setEditMCont(e.target.value); setEditMIsl(''); }}
                >
                  <option value="">Continente…</option>
                  {continents.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <select className="cad-select" value={editMIsl} onChange={e => setEditMIsl(e.target.value)}>
                  <option value="">Ilha…</option>
                  {islandsForEdit.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                </select>
                <button className="btn-save" type="submit" disabled={mineEditSav}>
                  {mineEditSav ? '…' : 'Salvar'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
