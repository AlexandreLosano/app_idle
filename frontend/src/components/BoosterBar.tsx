import { useTranslation } from 'react-i18next';

export interface BoosterInfo {
  somaOff: number;
  artefatosAtivos: number;
  totalComprado: number;
  busterAnuncio: number;
  total: number;
}

export function BoosterBar({ info }: { info: BoosterInfo }) {
  const { t } = useTranslation();
  return (
    <div className="booster-bar">
      <span className="bb-item">
        <span className="bb-label">{t('boosters.artifacts')}</span>
        <span className="bb-value">{t('boosters.active_count', { count: info.artefatosAtivos })}</span>
      </span>
      <span className="bb-sep">·</span>
      <span className="bb-item">
        <span className="bb-label">{t('boosters.soma_off')}</span>
        <span className="bb-value">{info.somaOff}</span>
      </span>
      <span className="bb-sep">+</span>
      <span className="bb-item">
        <span className="bb-label">{t('boosters.total_purchased')}</span>
        <span className="bb-value">{info.totalComprado}</span>
      </span>
      <span className="bb-sep">×</span>
      <span className="bb-item">
        <span className="bb-label">{t('boosters.ad_booster')}</span>
        <span className="bb-value">{info.busterAnuncio}</span>
      </span>
      <span className="bb-sep">=</span>
      <span className="bb-item bb-total">
        <span className="bb-label">{t('boosters.total')}</span>
        <span className="bb-value">{info.total}</span>
      </span>
    </div>
  );
}
