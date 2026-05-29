import type { ByteDef } from '../lib/types';
import { toHexByte } from '../lib/mirror';
import { t } from '../i18n/pt-BR';

/** Bytes que o leigo pode precisar mexer (equipamento). */
const SIMPLE_BYTE_LABELS: Record<number, string> = {
  15: 'Tipo de motor (EDS)',
  16: 'HHC, piloto, ACC, botão ESP',
  17: 'PLA, ACC extra, XDS',
  18: 'Tipo de sensor ABS',
  19: 'TPMS, botão ESC',
};

const SIMPLE_BYTE_HINTS: Record<number, string> = {
  15: 'Jetta 2.5 BR → deixe EDS2 (valor com 41 no final do byte).',
  16: 'Brasil Mk5: ACC deve ficar DESLIGADO (opção «ACC não instalado»).',
  17: 'Deixe tudo desmarcado se não tiver PLA nem ACC.',
  18: 'Maioria dos Jettas importados: sensores passivos (00).',
  19: 'Só mude se tiver TPMS original de fábrica.',
};

interface Props {
  defs: ByteDef[];
  bytes: number[];
}

export function BrSimpleBytePanel({ defs, bytes }: Props) {
  const editable = defs.filter(
    (d) => d.index >= 15 && d.index <= 19 && d.type !== 'mirror_of' && d.type !== 'vin_formula',
  );

  if (editable.length === 0) return null;

  return (
    <div className="br-simple-bytes">
      <h3>{t.brSimpleBytesTitle}</h3>
      <p className="hint">{t.brSimpleBytesHint}</p>
      {editable.map((def) => (
        <details key={def.index} className="br-byte-fold">
          <summary>
            Byte {def.index} — {SIMPLE_BYTE_LABELS[def.index] ?? def.label}{' '}
            <code className="mono">{toHexByte(bytes[def.index] ?? 0)}</code>
          </summary>
          <p className="hint">{SIMPLE_BYTE_HINTS[def.index]}</p>
          <p className="hint subtle">{def.label}</p>
        </details>
      ))}
      <p className="hint">{t.brBytesVinNote}</p>
    </div>
  );
}
