import { getBrMarketPreview } from '../lib/br-market-apply';
import { t } from '../i18n/pt-BR';

interface Props {
  vin: string;
  moduleSuffix: string | null;
}

export function BrMarketPanel({ vin, moduleSuffix }: Props) {
  const config = getBrMarketPreview(vin);
  if (!config) return null;

  return (
    <div className="vin-panel br-panel">
      <h3>{t.brMarketTitle}</h3>
      <p className="br-label">{config.label}</p>
      <p className="hint">
        {t.brModuleHint} {moduleSuffix ?? '—'}
        {' · '}
        {t.brEngineConfidence}: <strong>{config.engineConfidence}</strong>
      </p>
      <ul className="vin-byte-list">
        {config.rationale.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="hint">{t.brMarketFootnote}</p>
    </div>
  );
}
