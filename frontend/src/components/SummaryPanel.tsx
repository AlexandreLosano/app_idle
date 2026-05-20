import { useTranslation } from 'react-i18next';
import type { Island, Mine, Factor } from '../types';
import { BoosterBar, type BoosterInfo } from './BoosterBar';
import { computeProduction, minNextPrestige, formatTime } from '../utils/gameCalc';

interface Props {
  islands: Island[];
  mines: Mine[];
  factors: Factor[];
  boosterTotal: number;
  boosterInfo?: BoosterInfo;
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

function DonutChart({ atual, maximo, prestiges }: { atual: number; maximo: number; prestiges: string }) {
  const r    = 70;
  const cx   = 90;
  const cy   = 90;
  const circ = 2 * Math.PI * r;
  const pct  = maximo > 0 ? Math.min(atual / maximo, 1) : 0;
  const arc  = pct * circ;
  const full = pct >= 1;
  const color = full ? 'var(--ok)' : 'var(--accent-dark)';

  return (
    <svg viewBox="0 0 180 180" width={160} height={160}>
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
        {prestiges}
      </text>
    </svg>
  );
}

/* ── main component ──────────────────────────────────────────────────── */

export function SummaryPanel({ islands, mines, factors, boosterTotal, boosterInfo }: Props) {
  const { t } = useTranslation();
  const bf = boosterTotal / 10;

  const data = islands.map(island => {
    const im = mines.filter(m => m.island_id === island.id);
    const prodResult = computeProduction(im, factors, bf);
    const next = minNextPrestige(im, factors);
    const totalAtual  = im.reduce((s, m) => s + (m.prestigio_atual  ?? 0), 0);
    const totalMaximo = im.reduce((s, m) => s + (m.prestigio_maximo ?? 0), 0);
    const timeEst = prodResult.raw > 0 && next.raw > 0
      ? formatTime(next.raw / prodResult.raw)
      : '—';
    return { island, im, production: prodResult.display, next, totalAtual, totalMaximo, timeEst };
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
              <span className="sc-count">{t('islands.mines_count', { count: im.length })}</span>
            </div>

            <div className="sc-row">
              <span className="sc-label">{t('summary.production')}</span>
              <span className="sc-value sc-prod">{production}</span>
            </div>

            {next.raw > 0 && (
              <>
                <div className="sc-row">
                  <span className="sc-label">{t('summary.next_prestige')}</span>
                  <span className="sc-value sc-prestige">{next.display}</span>
                </div>
                <div className="sc-row">
                  <span className="sc-label">{t('summary.mine')}</span>
                  <span className="sc-value sc-mine">{next.nome}</span>
                </div>
                <div className="sc-row">
                  <span className="sc-label">{t('summary.time')}</span>
                  <span className="sc-value sc-time">{timeEst}</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Prestige comparison chart */}
      <div className="summary-prestige-chart">
        <h2>{t('summary.header')}</h2>
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
            <DonutChart atual={grandAtual} maximo={grandMaximo} prestiges={t('summary.prestiges')} />
            <span className="donut-label">Total Geral</span>
          </div>
        </div>
      </div>
    </section>
  );
}
