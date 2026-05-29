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

  const v = info.vehicle;
  const diff = referenceHex
    ? compareWithReference(bytes, referenceHex).filter((r) => !r.match && r.ref !== '—')
    : [];

  return (
    <div className="vin-panel">
      <h3>{t.chassisDetails}</h3>
      <dl className="vin-dl">
        <dt>WMI</dt>
        <dd>
          <code>{info.wmi}</code> — {info.wmiLabel}
        </dd>
        <dt>Ano-modelo (pos. 10)</dt>
        <dd>
          {v.modelYear !== null ? (
            <>
              <strong>{v.modelYear}</strong> («{v.modelYearChar}»)
            </>
          ) : (
            `«${v.modelYearChar}» — tabela desconhecida`
          )}
        </dd>
        <dt>Fábrica (pos. 11)</dt>
        <dd>
          <code>{v.plantCode}</code>
          {v.plantName ? ` — ${v.plantName}` : ' — código não mapeado'}
        </dd>
        <dt>Plataforma (pos. 7–8)</dt>
        <dd>
          <code>{v.platformCode}</code>
          {v.platform ? ` — ${v.platform}` : ''}
          {v.generation ? ` (${v.generation})` : ''}
        </dd>
        <dt>Modelos possíveis</dt>
        <dd>
          {v.possibleModels.length > 0 ? (
            <ul className="vin-byte-list compact">
              {v.possibleModels.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : (
            '— (código 7–8 não na base local)'
          )}
        </dd>
        <dt>VDS (pos. 4–9)</dt>
        <dd>
          <code>{info.vds}</code>
          {v.vdsHint && (
            <span className={`conf conf-${v.vdsConfidence}`}>
              {' '}
              — {v.vdsHint}
              {v.vdsConfidence ? ` [${v.vdsConfidence}]` : ''}
            </span>
          )}
        </dd>
        <dt>VIS / série (12–17)</dt>
        <dd>
          <code>{v.serialNumber}</code>
        </dd>
        <dt>Dígito verificador (pos. 9)</dt>
        <dd>
          {v.checkDigitValid ? (
            <span className="ok">válido ({v.checkDigit})</span>
          ) : (
            <span className="warn">
              esperado {v.checkDigitExpected}, lido {v.checkDigit}
            </span>
          )}
        </dd>
        <dt>Veículo (resumo)</dt>
        <dd>{info.vehicleHint}</dd>
        <dt>Byte 0 sugerido (ABS)</dt>
        <dd>
          {info.suggestedByte0 !== null
            ? `0x${toHexByte(info.suggestedByte0)}`
            : '—'}
        </dd>
        <dt>Bytes MK60 do VIN</dt>
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

      <details className="vin-limits">
        <summary>{t.vinOfflineLimits}</summary>
        <ul>
          {v.notDecodableOffline.map((line) => (
            <li key={line}>{line}</li>
          ))}
          <li>{t.vinExternalApiHint}</li>
        </ul>
      </details>

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
