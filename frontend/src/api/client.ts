import type { Mine, Island, Factor, Artefato, Continent } from '../types';

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
  continents: {
    list: () => get<Continent[]>('/continents'),
    create: (nome: string) => post<Continent>('/continents', { nome }),
    update: (id: number, data: { nome: string }) => put<Continent>(`/continents/${id}`, data),
  },
  mines: {
    list: (island_id?: number, continent_id?: number) => {
      const qs = new URLSearchParams();
      if (island_id)    qs.set('island_id',    String(island_id));
      if (continent_id) qs.set('continent_id', String(continent_id));
      const q = qs.toString();
      return get<Mine[]>(`/mines${q ? '?' + q : ''}`);
    },
    create: (data: { nome: string; island_id?: number }) =>
      post<Mine>('/mines', data),
    update: (nome: string, data: Partial<Mine>) =>
      put<Mine>(`/mines/${encodeURIComponent(nome)}`, data),
  },
  islands: {
    list: (continent_id?: number) => {
      const qs = continent_id ? `?continent_id=${continent_id}` : '';
      return get<Island[]>(`/islands${qs}`);
    },
    create: (data: { nome: string; continent_id: number }) =>
      post<Island>('/islands', data),
    update: (id: number, data: { nome?: string; continent_id?: number }) =>
      put<Island>(`/islands/${id}`, data),
  },
  factors: () => get<Factor[]>('/game/factors'),
  artefatos: {
    list: () => get<Artefato[]>('/artefatos'),
    create: (data: { quantidade: number; tipo?: string }) => post<Artefato>('/artefatos', data),
    update: (id: number, data: Partial<Artefato>) => put<Artefato>(`/artefatos/${id}`, data),
    getConfig: () => get<{ buster_anuncio: number | null; total_comprado: number | null }>('/artefatos/config'),
    updateConfig: (data: { buster_anuncio?: number | null; total_comprado?: number | null }) =>
      put<{ buster_anuncio: number | null; total_comprado: number | null }>('/artefatos/config', data),
  },
};
