import type { DecodedByte } from '../lib/types';

interface Props {
  rows: DecodedByte[];
}

export function DecodeTable({ rows }: Props) {
  if (!rows.length) return null;

  return (
    <div className="table-wrap">
      <table className="decode-table">
        <thead>
          <tr>
            <th>Byte</th>
            <th>Hex</th>
            <th>Bin</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.index} className={row.warnings.length ? 'row-warn' : ''}>
              <td>{row.index}</td>
              <td className="mono">{row.hex}</td>
              <td className="mono bin">{row.binary}</td>
              <td>
                {row.description}
                {row.warnings.map((w) => (
                  <div key={w} className="cell-warn">
                    {w}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
