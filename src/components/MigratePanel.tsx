import type { MigrationResult } from '../lib/types';
import { formatHexCoding } from '../lib/coding-engine';
import { HexOutput } from './HexOutput';

interface Props {
  result: MigrationResult | { error: string } | null;
  copyLabel: string;
  copyVcdsLabel: string;
  stepsTitle: string;
}

export function MigratePanel({ result, copyLabel, copyVcdsLabel, stepsTitle }: Props) {
  if (!result) return null;

  if ('error' in result) {
    return <p className="issue-error">{result.error}</p>;
  }

  const hex = formatHexCoding(result.bytes);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="migrate-result">
      <HexOutput
        value={hex}
        copyLabel={copyLabel}
        copyVcdsLabel={copyVcdsLabel}
        onCopy={() => copy(hex)}
        onCopySpaced={() => copy(formatHexCoding(result.bytes, true))}
      />
      {result.warnings.length > 0 && (
        <ul className="migrate-warnings">
          {result.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
      {result.steps.length > 0 && (
        <>
          <h4>{stepsTitle}</h4>
          <div className="table-wrap">
            <table className="decode-table">
              <thead>
                <tr>
                  <th>Byte</th>
                  <th>Antes</th>
                  <th>Depois</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {result.steps.map((s, i) => (
                  <tr key={i}>
                    <td>{s.byteIndex}</td>
                    <td className="mono">{s.before}</td>
                    <td className="mono">{s.after}</td>
                    <td>{s.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
