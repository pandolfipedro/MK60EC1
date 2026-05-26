import type { ByteDef } from '../lib/types';
import { toHexByte } from '../lib/mirror';

interface Props {
  def: ByteDef;
  value: number;
  onChange: (v: number) => void;
}

export function ByteEditor({ def, value, onChange }: Props) {
  if (def.type === 'mirror_of' || def.type === 'vin_formula') {
    return (
      <div className="byte-readonly">
        <span className="byte-label">{def.label}</span>
        <span className="mono">{toHexByte(value)}</span>
        <span className="byte-hint">{def.type === 'mirror_of' ? 'Espelho automático' : 'Do VIN'}</span>
      </div>
    );
  }

  if (def.type === 'enum' && def.values?.length) {
    return (
      <label className="byte-field">
        <span className="byte-label">{def.label}</span>
        <select
          className="input"
          value={toHexByte(value)}
          onChange={(e) => onChange(parseInt(e.target.value, 16))}
        >
          {def.values.map((opt) => (
            <option key={opt.hex} value={opt.hex}>
              {opt.hex} — {opt.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (def.type === 'bitfield' && def.bits?.length) {
    return (
      <fieldset className="byte-bits">
        <legend>{def.label}</legend>
        {def.bits.map((bit) => {
          const isSingle = (bit.mask & (bit.mask - 1)) === 0 && bit.mask > 0;
          if (!isSingle) return null;
          return (
            <label key={bit.mask} className="bit-check">
              <input
                type="checkbox"
                checked={(value & bit.mask) === bit.mask}
                onChange={(e) => {
                  if (e.target.checked) onChange(value | bit.mask);
                  else onChange(value & ~bit.mask);
                }}
              />
              {bit.label}
            </label>
          );
        })}
        <div className="byte-raw">
          Hex manual:{' '}
          <input
            className="input mono narrow"
            value={toHexByte(value)}
            onChange={(e) => {
              const n = parseInt(e.target.value, 16);
              if (!Number.isNaN(n)) onChange(n);
            }}
            maxLength={2}
          />
        </div>
      </fieldset>
    );
  }

  return (
    <label className="byte-field">
      <span className="byte-label">{def.label}</span>
      <input
        className="input mono narrow"
        value={toHexByte(value)}
        onChange={(e) => {
          const n = parseInt(e.target.value, 16);
          if (!Number.isNaN(n)) onChange(n);
        }}
        maxLength={2}
      />
    </label>
  );
}
