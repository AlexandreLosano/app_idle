import type { Mine, Factor } from '../types';

export function roundByMagnitude(n: number): number {
  if (n < 10)  return Math.round(n * 100) / 100;
  if (n < 100) return Math.round(n * 10)  / 10;
  return Math.round(n);
}

export function computeProduction(
  mines: Mine[], factors: Factor[], boosterFactor: number,
): { display: string; raw: number } {
  const factorMap = new Map(factors.map(f => [f.letra, f]));
  const values: Array<{ nivel: number; cont: number }> = [];

  for (const m of mines) {
    const components = [
      { nivel: m.armazem_nivel,  letra: m.armazem_letra },
      { nivel: m.elevador_nivel, letra: m.elevador_letra },
      { nivel: m.extracao_nivel, letra: m.extracao_letra },
    ];
    if (components.some(c => c.nivel == null || !c.letra)) continue;
    const scored = components.map(c => {
      const cont = factorMap.get(c.letra!)?.cont ?? 1;
      const n = c.nivel ?? 0;
      return { nivel: n, cont, score: (cont - 1) * 100 + Math.log10(n > 0 ? n : 0.001) };
    });
    const min = scored.reduce((a, b) => a.score < b.score ? a : b);
    if (min.nivel > 0) values.push({ nivel: min.nivel, cont: min.cont });
  }

  if (values.length === 0) return { display: '—', raw: 0 };

  const maxCont = Math.max(...values.map(v => v.cont));
  let total = 0;
  for (const v of values) total += v.nivel / Math.pow(1000, maxCont - v.cont);
  if (boosterFactor > 0) total *= boosterFactor;

  const sorted = [...factors].sort((a, b) => a.cont - b.cont);
  let cont = maxCont;
  while (total >= 1000 && cont < sorted[sorted.length - 1].cont) { total /= 1000; cont++; }

  const letra = sorted.find(f => f.cont === cont)?.letra ?? '?';
  const raw = total * Math.pow(1000, cont - 1);
  return { display: `${roundByMagnitude(total)}${letra}`, raw };
}

export function minNextPrestige(
  mines: Mine[], factors: Factor[],
): { display: string; raw: number; nome: string } {
  const factorMap = new Map(factors.map(f => [f.letra, f]));
  const candidates = mines
    .filter(m => m.proximo_prestigio_valor != null && m.proximo_prestigio_letra)
    .map(m => {
      const cont = factorMap.get(m.proximo_prestigio_letra!)?.cont ?? 1;
      const valor = m.proximo_prestigio_valor!;
      return {
        nome: m.nome,
        valor,
        letra: m.proximo_prestigio_letra!,
        score: (cont - 1) * 100 + Math.log10(valor > 0 ? valor : 0.001),
        raw: valor * Math.pow(1000, cont - 1),
      };
    });
  if (candidates.length === 0) return { display: '—', raw: 0, nome: '' };
  const min = candidates.reduce((a, b) => a.score < b.score ? a : b);
  return { display: `${min.valor}${min.letra}`, raw: min.raw, nome: min.nome };
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
