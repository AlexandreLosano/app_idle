import type { UpgradeHint } from '../utils/upgradeAdvisor';

interface Props {
  hint: UpgradeHint | null;
}

function upArrows(targetRaw: number, bottleneckRaw: number): string {
  if (bottleneckRaw <= 0) return '↑↑↑';
  const letterDiff = Math.floor(Math.log10(targetRaw / bottleneckRaw) / 3);
  if (letterDiff >= 3) return '↑↑↑';
  if (letterDiff === 2) return '↑↑';
  return '↑';
}

export function UpgradeArrow({ hint }: Props) {
  if (!hint) return null;
  const symbol = hint.signal === 'up'
    ? upArrows(hint.targetRaw, hint.bottleneckRaw)
    : hint.signal === 'ok' ? '✓' : '→';
  return (
    <span className={`upgrade-arrow ${hint.signal}`}>
      {symbol}
    </span>
  );
}
