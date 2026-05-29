import { decodeVinChassis, compareWithReference } from '../lib/vin-decode';
import { VIN_FORMULA_BYTES } from '../lib/vin';
import { toHexByte } from '../lib/mirror';
import { t } from '../i18n/pt-BR';

const VIN_BYTE_INDICES = new Set(VIN_FORMULA_BYTES.map((f) => f.index));

interface Props {
  vin: string;
  bytes: number[];
  referenceHex?: string;
}

export function VinChassisPanel({ vin, bytes, referenceHex }: Props) {
  const info = decodeVinChassis(vin);
  if (!info) return null;

  const diff = referenceHex
    ? compareWithReference(bytes, referenceHex).filter((r) => !r.match && r.ref !== '—')
    : [];

  return (
    <div className="vin-panel">
      <h3>{t.chassisDetails}</h3>
      <dl className="vin-dl">
        <dt>WMI</dt>
        <dd>{info.wmi}</dd>
        <dt>VDS (4–9)</dt>
        <dd>{info.vds}</dd>
        <dt>VIS (10–17)</dt>
        <dd>{info.vis}</dd>
        <dt>Modelo (pos. 7–8)</dt>
        <dd>
          <code>{info.modelCode78}</code> — pos. 7 «{info.char7}», pos. 8 «{info.char8}»
        </dd>
        <dt>Veículo (heurística)</dt>
        <dd>{info.vehicleHint}</dd>
        <dt>Byte 0 sugerido</dt>
        <dd>
          {info.suggestedByte0 !== null
            ? `0x${toHexByte(info.suggestedByte0)} (ajuste manual se o de fábrica for outro)`
            : '—'}
        </dd>
        <dt>Bytes do VIN (calculados)</dt>
        <dd>
          <ul className="vin-byte-list">
            <li>
              B1 ← {info.modelCode78}: 0x{toHexByte(info.byte1Expected ?? 0)}
            </li>
            <li>
              B3 ← «{info.char8}»: 0x{toHexByte(info.byte3Expected ?? 0)}
            </li>
            {info.vinFormulaBytes
              .filter((f) => f.index > 3)
              .map((f) => (
                <li key={f.index}>
                  B{f.index}: 0x{f.expected !== null ? toHexByte(f.expected) : '—'}
                </li>
              ))}
          </ul>
        </dd>
      </dl>

      {referenceHex && diff.length > 0 && (
        <div className="vin-diff">
          <h4>{t.vinDiffTitle}</h4>
          <p className="hint">{t.vinDiffHint}</p>
          <table className="mini-table">
            <thead>
              <tr>
                <th>Byte</th>
                <th>Ref.</th>
                <th>Atual</th>
                <th>Origem</th>
              </tr>
            </thead>
            <tbody>
              {diff.map((row) => (
                <tr key={row.index}>
                  <td>{row.index}</td>
                  <td>{row.ref}</td>
                  <td>{row.actual}</td>
                  <td>{VIN_BYTE_INDICES.has(row.index) ? 'VIN' : 'PR / manual'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
