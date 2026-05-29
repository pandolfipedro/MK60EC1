import { BYTE1_VIN_PAIR, BYTE3_VIN_CHAR } from '../data/vin-maps';

const VIN_CHARS = /^[A-HJ-NPR-Z0-9]{17}$/;

export function normalizeVin(vin: string): string {
  return vin.replace(/\s/g, '').toUpperCase();
}

export function isValidVin(vin: string): boolean {
  return VIN_CHARS.test(normalizeVin(vin));
}

function vinDigitAt(vin: string, index: number): number {
  const ch = vin[index];
  if (ch >= '0' && ch <= '9') return parseInt(ch, 10);
  return 0;
}

export function computeVinByte(formula: string, vin: string): number | null {
  const v = normalizeVin(vin);
  if (!isValidVin(v)) return null;

  switch (formula) {
    case 'byte1_map': {
      const pair = v.slice(6, 8);
      return BYTE1_VIN_PAIR[pair] ?? BYTE1_VIN_PAIR['1K'] ?? null;
    }
    case 'byte3_map': {
      const ch = v[7];
      return BYTE3_VIN_CHAR[ch] ?? null;
    }
    case 'add_0x22':
      return (0x22 + vinDigitAt(v, 12)) & 0xff;
    case 'add_0xFA':
      return (0xfa + vinDigitAt(v, 13)) & 0xff;
    case 'add_0x0B':
      return (0x0b + vinDigitAt(v, 14)) & 0xff;
    case 'add_0xE4':
      return (0xe4 + vinDigitAt(v, 15)) & 0xff;
    case 'add_0x19':
      return (0x19 + vinDigitAt(v, 16)) & 0xff;
    default:
      return null;
  }
}

export function applyVinBytes(
  bytes: number[],
  vin: string,
  formulas: { index: number; formula: string }[],
): number[] {
  const out = [...bytes];
  for (const { index, formula } of formulas) {
    const val = computeVinByte(formula, vin);
    if (val !== null && index < out.length) out[index] = val;
  }
  return out;
}

export const VIN_FORMULA_BYTES: { index: number; formula: string }[] = [
  { index: 1, formula: 'byte1_map' },
  { index: 3, formula: 'byte3_map' },
  { index: 5, formula: 'add_0x22' },
  { index: 7, formula: 'add_0xFA' },
  { index: 9, formula: 'add_0x0B' },
  { index: 11, formula: 'add_0xE4' },
  { index: 13, formula: 'add_0x19' },
];
