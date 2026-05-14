export interface BoosterInfo {
  somaOff: number;
  artefatosAtivos: number;
  totalComprado: number;
  busterAnuncio: number;
  total: number;
}

export function BoosterBar({ info }: { info: BoosterInfo }) {
  return (
    <div className="booster-bar">
      <span className="bb-item">
        <span className="bb-label">Artefatos</span>
        <span className="bb-value">{info.artefatosAtivos} ativos</span>
      </span>
      <span className="bb-sep">·</span>
      <span className="bb-item">
        <span className="bb-label">Soma off</span>
        <span className="bb-value">{info.somaOff}</span>
      </span>
      <span className="bb-sep">+</span>
      <span className="bb-item">
        <span className="bb-label">Comprados</span>
        <span className="bb-value">{info.totalComprado}</span>
      </span>
      <span className="bb-sep">×</span>
      <span className="bb-item">
        <span className="bb-label">Anúncio</span>
        <span className="bb-value">{info.busterAnuncio}</span>
      </span>
      <span className="bb-sep">=</span>
      <span className="bb-item bb-total">
        <span className="bb-label">Booster</span>
        <span className="bb-value">{info.total}</span>
      </span>
    </div>
  );
}
