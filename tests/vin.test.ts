import { describe, expect, it } from 'vitest';
import { computeVinByte, isValidVin } from '../src/lib/vin';

describe('VIN', () => {
  it('rejeita VIN com O', () => {
    expect(isValidVin('WVWZZZ1KZAO123456')).toBe(false);
  });

  it('aceita VIN VAG válido', () => {
    expect(isValidVin('WVWZZZ1KZAM679548')).toBe(true);
  });

  it('mapeia posição 7 para byte 1 (par 3B)', () => {
    const vin = 'WVWZZZ3BWA1234567';
    expect(computeVinByte('byte1_map', vin)).toBe(0x31);
  });

  it('calcula byte 5 com 0x22 + dígito 13', () => {
    const vin = 'WVWZZZ1KZAM679548';
    expect(computeVinByte('add_0x22', vin)).toBe(0x29);
  });
});
