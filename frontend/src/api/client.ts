import type { Mine, Continent, GameMode, Factor, Artefato, Meta } from '../types';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function put<T>(path: string, body: Partial<T>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  gameModes: {
    list: () => get<GameMode[]>('/game-modes'),
    create: (nome: string) => post<GameMode>('/game-modes', { nome }),
    update: (id: number, data: { nome: string }) => put<GameMode>(`/game-modes/${id}`, data),
  },
  continents: {
    list: (game_mode_id?: number) => {
      const qs = game_mode_id ? `?game_mode_id=${game_mode_id}` : '';
      return get<Continent[]>(`/continents${qs}`);
    },
    create: (data: { nome: string; game_mode_id: number }) =>
      post<Continent>('/continents', data),
    update: (id: number, data: { nome?: string; game_mode_id?: number }) =>
      put<Continent>(`/continents/${id}`, data),
  },
  mines: {
    list: (continent_id?: number, game_mode_id?: number) => {
      const qs = new URLSearchParams();
      if (continent_id) qs.set('continent_id', String(continent_id));
      if (game_mode_id) qs.set('game_mode_id', String(game_mode_id));
      const q = qs.toString();
      return get<Mine[]>(`/mines${q ? '?' + q : ''}`);
    },
    create: (data: { nome: string; continent_id?: number }) =>
      post<Mine>('/mines', data),
    update: (nome: string, data: Partial<Mine>) =>
      put<Mine>(`/mines/${encodeURIComponent(nome)}`, data),
  },
  factors: () => get<Factor[]>('/game/factors'),
  detalheValores: {
    list: (mineIds: number[]) =>
      get<{ mine_id: number; col_key: string; valor: string }[]>(
        `/detalhe-valores?mine_ids=${mineIds.join(',')}`
      ),
    save: (mineId: number, colKey: string, valor: string) =>
      put<{ mine_id: number; col_key: string; valor: string }>(
        `/detalhe-valores/${mineId}/${encodeURIComponent(colKey)}`,
        { valor } as never
      ),
  },
  artefatos: {
    list: () => get<Artefato[]>('/artefatos'),
    create: (data: { quantidade: number; tipo?: string }) => post<Artefato>('/artefatos', data),
    update: (id: number, data: Partial<Artefato>) => put<Artefato>(`/artefatos/${id}`, data),
    getConfig: () => get<{ buster_anuncio: number | null; total_comprado: number | null; mult_off: number | null; horas_sono: number | null }>('/artefatos/config'),
    updateConfig: (data: { buster_anuncio?: number | null; total_comprado?: number | null; mult_off?: number | null; horas_sono?: number | null }) =>
      put<{ buster_anuncio: number | null; total_comprado: number | null; mult_off: number | null; horas_sono: number | null }>('/artefatos/config', data),
  },
  metas: {
    list: () => get<Meta[]>('/metas'),
    update: (continent_id: number, data: { valor: number; letra: string; unidade: 's' | 'min' | 'd' }) =>
      put<Meta>(`/metas/${continent_id}`, data as never),
  },
};
