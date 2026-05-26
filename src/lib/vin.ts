const VIN_CHARS = /^[A-HJ-NPR-Z0-9]{17}$/;

/** VIN position 7 (index 6) → byte 1 */
const BYTE1_MAP: Record<string, number> = {
  '3B': 0x31,
  '3C': 0x32,
  '3D': 0x33,
  '3F': 0x35,
  '42': 0x38,
  '4B': 0x41,
  '50': 0x46,
  '55': 0x4b,
  '58': 0x4e,
  '5D': 0x53,
};

/** VIN position 8 (index 7) → byte 3 */
const BYTE3_MAP: Record<string, number> = {
  '03': 0x41,
  '04': 0x42,
  '05': 0x43,
  '06': 0x44,
  '07': 0x45,
  '08': 0x46,
  '0A': 0x48,
  '0C': 0x4a,
  '0D': 0x4b,
  '0E': 0x4c,
  '0F': 0x4d,
  '12': 0x50,
  '16': 0x54,
  '1C': 0x5a,
  F5: 0x33,
  F6: 0x34,
  F8: 0x36,
  FA: 0x38,
};

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

export function computeVinByte(
  formula: string,
  vin: string,
): number | null {
  const v = normalizeVin(vin);
  if (!isValidVin(v)) return null;

  switch (formula) {
    case 'byte1_map': {
      const pair = v.slice(6, 8);
      return BYTE1_MAP[pair] ?? null;
    }
    case 'byte3_map': {
      const pair = v.slice(7, 9);
      return BYTE3_MAP[pair] ?? null;
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

export function applyVinBytes(bytes: number[], vin: string, formulas: { index: number; formula: string }[]): number[] {
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
