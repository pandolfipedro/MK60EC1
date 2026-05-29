import { describe, expect, it } from 'vitest';
import { computeVinByte, isValidVin } from '../src/lib/vin';

describe('VIN', () => {
  it('rejeita VIN com O', () => {
    expect(isValidVin('WVWZZZ1KZAO123456')).toBe(false);
  });

  it('aceita VIN VAG válido', () => {
    expect(isValidVin('WVWZZZ1KZAM679548')).toBe(true);
  });

  it('mapeia par 7–8 do VIN para byte 1 (valor hex 3B)', () => {
    const vin = 'WVWZZZ3BWA1234567';
    expect(computeVinByte('byte1_map', vin)).toBe(0x3b);
  });

  it('mapeia 1K → 0x3B no byte 1', () => {
    expect(computeVinByte('byte1_map', '3VWRE11K3AM137623')).toBe(0x3b);
  });

  it('mapeia 8º caractere K → 0x0D no byte 3', () => {
    expect(computeVinByte('byte3_map', '3VWRE11K3AM137623')).toBe(0x0d);
  });

  it('calcula byte 5 com 0x22 + dígito 13', () => {
    const vin = 'WVWZZZ1KZAM679548';
    expect(computeVinByte('add_0x22', vin)).toBe(0x29);
  });
});
