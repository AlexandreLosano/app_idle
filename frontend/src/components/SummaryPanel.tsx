import type { Island, Mine, Factor } from '../types';
import { BoosterBar, type BoosterInfo } from './BoosterBar';

interface Props {
  islands: Island[];
  mines: Mine[];
  factors: Factor[];
  boosterTotal: number;
  boosterInfo?: BoosterInfo;
}

/* ── helpers ─────────────────────────────────────────────────────────── */

function roundByMagnitude(n: number): number {
  if (n < 10)  return Math.round(n * 100) / 100;
  if (n < 100) return Math.round(n * 10)  / 10;
  return Math.round(n);
}

function computeProduction(
  islandMines: Mine[], factors: Factor[], boosterFactor: number
): string {
  const factorMap = new Map(factors.map(f => [f.letra, f]));
  const values: Array<{ nivel: number; cont: number }> = [];

  for (const m of islandMines) {
    const comps = [
      { nivel: m.armazem_nivel,  letra: m.armazem_letra },
      { nivel: m.elevador_nivel, letra: m.elevador_letra },
      { nivel: m.extracao_nivel, letra: m.extracao_letra },
    ];
    if (comps.some(c => c.nivel == null || !c.letra)) continue;
    const scored = comps.map(c => {
      const cont = factorMap.get(c.letra!)?.cont ?? 1;
      const n = c.nivel ?? 0;
      return { nivel: n, cont, score: (cont - 1) * 100 + Math.log10(n > 0 ? n : 0.001) };
    });
    const min = scored.reduce((a, b) => a.score < b.score ? a : b);
    if (min.nivel > 0) values.push({ nivel: min.nivel, cont: min.cont });
  }

  if (values.length === 0) return '—';

  const maxCont = Math.max(...values.map(v => v.cont));
  let total = 0;
  for (const v of values) total += v.nivel / Math.pow(1000, maxCont - v.cont);
  if (boosterFactor > 0) total *= boosterFactor;

  const sorted = [...factors].sort((a, b) => a.cont - b.cont);
  let cont = maxCont;
  while (total >= 1000 && cont < sorted[sorted.length - 1].cont) { total /= 1000; cont++; }

  const letra = sorted.find(f => f.cont === cont)?.letra ?? '?';
  return `${roundByMagnitude(total)}${letra}`;
}

interface NextPrestige { nome: string; valor: number; letra: string; raw: number; prodRaw: number }

function minNextPrestige(islandMines: Mine[], factors: Factor[], boosterFactor: number): NextPrestige | null {
  const factorMap = new Map(factors.map(f => [f.letra, f]));

  // production raw for time estimate
  const values: Array<{ nivel: number; cont: number }> = [];
  for (const m of islandMines) {
    const comps = [
      { nivel: m.armazem_nivel,  letra: m.armazem_letra },
      { nivel: m.elevador_nivel, letra: m.elevador_letra },
      { nivel: m.extracao_nivel, letra: m.extracao_letra },
    ];
    if (comps.some(c => c.nivel == null || !c.letra)) continue;
    const scored = comps.map(c => {
      const cont = factorMap.get(c.letra!)?.cont ?? 1;
      const n = c.nivel ?? 0;
      return { nivel: n, cont, score: (cont - 1) * 100 + Math.log10(n > 0 ? n : 0.001) };
    });
    const min = scored.reduce((a, b) => a.score < b.score ? a : b);
    if (min.nivel > 0) values.push({ nivel: min.nivel, cont: min.cont });
  }
  let prodRaw = 0;
  if (values.length > 0) {
    const maxCont = Math.max(...values.map(v => v.cont));
    let total = 0;
    for (const v of values) total += v.nivel / Math.pow(1000, maxCont - v.cont);
    if (boosterFactor > 0) total *= boosterFactor;
    const sorted = [...factors].sort((a, b) => a.cont - b.cont);
    let cont = maxCont;
    while (total >= 1000 && cont < sorted[sorted.length - 1].cont) { total /= 1000; cont++; }
    prodRaw = total * Math.pow(1000, cont - 1);
  }

  const candidates = islandMines
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
        prodRaw,
      };
    });
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => a.score < b.score ? a : b);
}

function formatTime(seconds: number): string {
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

/* ── prestige discrete bar ───────────────────────────────────────────── */

const MAX_SEGS = 40;

function PrestigeBar({ atual, maximo }: { atual: number; maximo: number }) {
  if (maximo === 0) return <span className="sp-empty">—</span>;
  const segs = Math.min(maximo, MAX_SEGS);
  const filled = maximo <= MAX_SEGS
    ? atual
    : Math.round((atual / maximo) * MAX_SEGS);
  const full = filled >= segs && atual >= maximo;

  return (
    <div className="prestige-bar-wrap">
      <div className={`prestige-bar ${full ? 'prestige-bar-full' : ''}`}>
        {Array.from({ length: segs }).map((_, i) => (
          <div key={i} className={`pseg ${i < filled ? 'pseg-on' : 'pseg-off'}`} />
        ))}
      </div>
      <span className="prestige-bar-count">
        {atual}/{maximo}
      </span>
    </div>
  );
}

/* ── donut chart ─────────────────────────────────────────────────────── */

function DonutChart({ atual, maximo }: { atual: number; maximo: number }) {
  const r    = 70;
  const cx   = 90;
  const cy   = 90;
  const circ = 2 * Math.PI * r;
  const pct  = maximo > 0 ? Math.min(atual / maximo, 1) : 0;
  const arc  = pct * circ;
  const full = pct >= 1;
  const color = full ? 'var(--ok)' : 'var(--accent-dark)';

  return (
    <svg viewBox="0 0 180 180" width={200} height={200}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface2)" strokeWidth={16} />
      {pct > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={16}
          strokeDasharray={`${arc} ${circ}`}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
        />
      )}
      <text x={cx} y={cy - 10} textAnchor="middle"
        fill={full ? 'var(--ok)' : 'var(--text)'}
        fontSize={30} fontWeight={700} fontFamily="'Courier New',monospace">
        {Math.round(pct * 100)}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-muted)" fontSize={13}>
        {atual}/{maximo}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill="var(--text-muted)" fontSize={11}>
        prestígios
      </text>
    </svg>
  );
}

/* ── main component ──────────────────────────────────────────────────── */

export function SummaryPanel({ islands, mines, factors, boosterTotal, boosterInfo }: Props) {
  const bf = boosterTotal / 10;

  const data = islands.map(island => {
    const im = mines.filter(m => m.island_id === island.id);
    const production = computeProduction(im, factors, bf);
    const next = minNextPrestige(im, factors, bf);
    const totalAtual  = im.reduce((s, m) => s + (m.prestigio_atual  ?? 0), 0);
    const totalMaximo = im.reduce((s, m) => s + (m.prestigio_maximo ?? 0), 0);
    const timeEst = next && next.prodRaw > 0 && next.raw > 0
      ? formatTime(next.raw / next.prodRaw)
      : '—';
    return { island, im, production, next, totalAtual, totalMaximo, timeEst };
  });

  const grandAtual  = data.reduce((s, d) => s + d.totalAtual,  0);
  const grandMaximo = data.reduce((s, d) => s + d.totalMaximo, 0);

  return (
    <section className="panel">
      {boosterInfo && <BoosterBar info={boosterInfo} />}
      {/* Island cards */}
      <div className="summary-cards">
        {data.map(({ island, im, production, next, timeEst }) => (
          <div key={island.id} className="summary-card">
            <div className="sc-header">
              <strong className="sc-name">{island.nome}</strong>
              <span className="sc-count">{im.length} minas</span>
            </div>

            <div className="sc-row">
              <span className="sc-label">Produção</span>
              <span className="sc-value sc-prod">{production}</span>
            </div>

            {next && (
              <>
                <div className="sc-row">
                  <span className="sc-label">Próx. Prestígio</span>
                  <span className="sc-value sc-prestige">{next.valor}{next.letra}</span>
                </div>
                <div className="sc-row">
                  <span className="sc-label">Mina</span>
                  <span className="sc-value sc-mine">{next.nome}</span>
                </div>
                <div className="sc-row">
                  <span className="sc-label">Tempo</span>
                  <span className="sc-value sc-time">{timeEst}</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Prestige comparison chart */}
      <div className="summary-prestige-chart">
        <h2>Prestígio por Ilha</h2>
        <div className="prestige-chart-layout">
          <div className="prestige-rows">
            {data.map(({ island, totalAtual, totalMaximo }) => (
              <div key={island.id} className="prestige-row">
                <span className="prestige-island-name">{island.nome}</span>
                <PrestigeBar atual={totalAtual} maximo={totalMaximo} />
              </div>
            ))}
          </div>
          <div className="prestige-donut">
            <DonutChart atual={grandAtual} maximo={grandMaximo} />
            <span className="donut-label">Total Geral</span>
          </div>
        </div>
      </div>
    </section>
  );
}
