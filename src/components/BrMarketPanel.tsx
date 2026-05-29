import type { BrBody } from '../data/br-jetta-market';
import { BR_JETTA_TIMELINE } from '../data/br-jetta-timeline';
import {
  getBrCodingPlainSummary,
  getBrEquipmentSheet,
} from '../data/br-equipment-catalog';
import { getBrMarketPreview, moduleSuffixFromPart } from '../lib/br-market-apply';
import { t } from '../i18n/pt-BR';

interface Props {
  vin: string;
  partQuery: string;
  bodyChoice: BrBody | 'auto';
  onBodyChoiceChange: (v: BrBody | 'auto') => void;
}

export function BrMarketPanel({
  vin,
  partQuery,
  bodyChoice,
  onBodyChoiceChange,
}: Props) {
  const bodyOverride = bodyChoice === 'auto' ? undefined : bodyChoice;
  const config = getBrMarketPreview(vin, bodyOverride);
  if (!config) return null;

  const sheet = getBrEquipmentSheet(config);
  const suffix = moduleSuffixFromPart(partQuery);
  const codingLines = suffix
    ? getBrCodingPlainSummary(config, suffix)
    : getBrCodingPlainSummary(config, 'CC');

  return (
    <div className="vin-panel br-panel">
      <h3>{t.brMarketTitle}</h3>
      <p className="br-label">{sheet.title}</p>
      <p className="hint">{t.brSimpleIntro}</p>

      <fieldset className="br-body-pick">
        <legend>{t.brBodyLegend}</legend>
        <label className="body-opt">
          <input
            type="radio"
            name="brBody"
            checked={bodyChoice === 'auto'}
            onChange={() => onBodyChoiceChange('auto')}
          />
          {t.brBodyAuto}
          {bodyChoice === 'auto' && (
            <span className="hint inline"> — {config.bodyDetectHint}</span>
          )}
        </label>
        <label className="body-opt">
          <input
            type="radio"
            name="brBody"
            checked={bodyChoice === 'SEDAN'}
            onChange={() => onBodyChoiceChange('SEDAN')}
          />
          {t.brBodySedan}
        </label>
        <label className="body-opt">
          <input
            type="radio"
            name="brBody"
            checked={bodyChoice === 'VARIANT'}
            onChange={() => onBodyChoiceChange('VARIANT')}
          />
          {t.brBodyVariant}
        </label>
      </fieldset>

      {config.bodyConfidence === 'baixa' && bodyChoice === 'auto' && (
        <p className="hint warn-box">{t.brBodyUncertain}</p>
      )}

      <div className="br-cols">
        <section>
          <h4 className="br-h4 ok-title">{t.brHas}</h4>
          <ul className="br-list">
            {sheet.has.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="br-h4 no-title">{t.brNotHas}</h4>
          <ul className="br-list">
            {sheet.notHas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      {sheet.optional.length > 0 && (
        <section className="br-optional">
          <h4 className="br-h4">{t.brOptional}</h4>
          <ul className="br-list">
            {sheet.optional.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="br-verify">
        <h4 className="br-h4">{t.brVerify}</h4>
        <ul className="br-list">
          {sheet.verify.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="br-coding-summary">
        <h4 className="br-h4">{t.brCodingApplied}</h4>
        <ul className="br-list">
          {codingLines.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <details className="vin-limits">
        <summary>{t.brTimelineTitle}</summary>
        <ul className="br-list timeline">
          {BR_JETTA_TIMELINE.map((row) => (
            <li key={row.years}>
              <strong>{row.years}</strong> — {row.model}: {row.engine}. {row.notes}
            </li>
          ))}
        </ul>
      </details>

      <details className="vin-limits">
        <summary>{t.brTechnicalDetails}</summary>
        <p className="hint">
          {t.brModuleHint} {suffix ?? '—'} · {t.brEngineConfidence}:{' '}
          <strong>{config.engineConfidence}</strong>
        </p>
        <ul className="vin-byte-list">
          {config.rationale.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
