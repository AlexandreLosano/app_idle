import type { Mine, Factor } from '../types';

export type UpgradeSignal = 'up' | 'ok' | 'skip';

export interface UpgradeHint {
  signal: UpgradeSignal;
  targetRaw: number;
}

// Reference percentages for 5 active mines; scaled by index-picking for other counts.
const BASE_PCTS = [0.01, 0.05, 0.20, 0.25, 0.50];

function getPercentages(n: number): number[] {
  if (n <= 1) return [BASE_PCTS[BASE_PCTS.length - 1]];
  return Array.from({ length: n }, (_, i) => {
    const idx = Math.round(i * (BASE_PCTS.length - 1) / (n - 1));
    return BASE_PCTS[idx];
  });
}

function prestigeScore(valor: number, letra: string, factors: Factor[]): number {
  const cont = factors.find(f => f.letra === letra)?.cont ?? 1;
  return (cont - 1) * 100 + Math.log10(valor > 0 ? valor : 0.001);
}

function prestigeRaw(valor: number, letra: string, factors: Factor[]): number {
  const cont = factors.find(f => f.letra === letra)?.cont ?? 1;
  return valor * Math.pow(1000, cont - 1);
}

function mineBottleneckRaw(m: Mine, factors: Factor[]): number {
  const comps = [
    { nivel: m.armazem_nivel,  letra: m.armazem_letra },
    { nivel: m.elevador_nivel, letra: m.elevador_letra },
    { nivel: m.extracao_nivel, letra: m.extracao_letra },
  ];
  if (comps.some(c => c.nivel == null || !c.letra)) return 0;
  const scored = comps.map(c => {
    const cont = factors.find(f => f.letra === c.letra!)?.cont ?? 1;
    const n = c.nivel!;
    return { n, cont, score: (cont - 1) * 100 + Math.log10(n > 0 ? n : 0.001) };
  });
  const min = scored.reduce((a, b) => a.score < b.score ? a : b);
  return min.n * Math.pow(1000, min.cont - 1);
}

function roundByMagnitude(n: number): number {
  if (n < 10)  return Math.round(n * 100) / 100;
  if (n < 100) return Math.round(n * 10)  / 10;
  return Math.round(n);
}

export function formatRaw(rawValue: number, factors: Factor[]): string {
  const sorted = [...factors].sort((a, b) => a.cont - b.cont);
  if (sorted.length === 0 || rawValue <= 0) return '—';
  let value = rawValue;
  let idx = 0;
  while (value >= 1000 && idx < sorted.length - 1) {
    value /= 1000;
    idx++;
  }
  return `${roundByMagnitude(value)}${sorted[idx].letra}`;
}

export function computeUpgradeHints(
  mines: Mine[],
  factors: Factor[],
): Record<number, UpgradeHint | null> {
  const result: Record<number, UpgradeHint | null> = {};

  const active = mines.filter(
    m => m.proximo_prestigio_valor != null && m.proximo_prestigio_letra,
  );

  if (active.length < 2) return result;

  const sorted = [...active].sort((a, b) =>
    prestigeScore(a.proximo_prestigio_valor!, a.proximo_prestigio_letra!, factors) -
    prestigeScore(b.proximo_prestigio_valor!, b.proximo_prestigio_letra!, factors),
  );

  const rank1 = sorted[0];
  const baseRaw =
    prestigeRaw(rank1.proximo_prestigio_valor!, rank1.proximo_prestigio_letra!, factors) / 86400;

  const pcts = getPercentages(sorted.length);

  sorted.forEach((m, i) => {
    const targetRaw = baseRaw * pcts[i];
    const bottleneck = mineBottleneckRaw(m, factors);
    let signal: UpgradeSignal;
    if (bottleneck < targetRaw * 0.9) {
      signal = 'up';
    } else if (bottleneck > targetRaw * 1.1) {
      signal = 'skip';
    } else {
      signal = 'ok';
    }
    result[m.id] = { signal, targetRaw };
  });

  return result;
}
