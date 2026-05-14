import type { Mine, Island, Factor, Artefato } from '../types';

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
  mines: {
    list: (island_id?: number) => {
      const qs = island_id ? `?island_id=${island_id}` : '';
      return get<Mine[]>(`/mines${qs}`);
    },
    update: (nome: string, data: Partial<Mine>) =>
      put<Mine>(`/mines/${encodeURIComponent(nome)}`, data),
  },
  islands: {
    list: () => get<Island[]>('/islands'),
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
