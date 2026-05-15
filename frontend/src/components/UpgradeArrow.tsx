import type { UpgradeHint } from '../utils/upgradeAdvisor';

interface Props {
  hint: UpgradeHint | null;
}

const SYMBOLS: Record<string, string> = { up: '↑', ok: '✓', skip: '→' };

export function UpgradeArrow({ hint }: Props) {
  if (!hint) return null;
  return (
    <span className={`upgrade-arrow ${hint.signal}`}>
      {SYMBOLS[hint.signal]}
    </span>
  );
}
