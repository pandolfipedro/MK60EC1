import { describe, expect, it } from 'vitest';
import { applyVinToCoding, createEmptyCoding, parseHexCoding } from '../src/lib/coding-engine';
import { REFERENCE_LONG_CODES } from '../src/data/reference-presets';
import { compareWithReference, decodeVinChassis } from '../src/lib/vin-decode';
import { buildFullFromChassisForPart } from '../src/lib/br-market-apply';
import { computeVinByte } from '../src/lib/vin';

const VIN = REFERENCE_LONG_CODES.jettaVin;
const REF = REFERENCE_LONG_CODES.jettaCc;

describe('Jetta Mk5 CC + VIN 3VWRE11K3AM137623', () => {
  it('mapeia 1K → byte 1 = 0x3B e K → byte 3 = 0x0D', () => {
    expect(computeVinByte('byte1_map', VIN)).toBe(0x3b);
    expect(computeVinByte('byte3_map', VIN)).toBe(0x0d);
  });

  it('calcula bytes 5,7,9,11,13 do VIN', () => {
    expect(computeVinByte('add_0x22', VIN)).toBe(0x25);
    expect(computeVinByte('add_0xFA', VIN)).toBe(0x01);
    expect(computeVinByte('add_0x0B', VIN)).toBe(0x11);
    expect(computeVinByte('add_0xE4', VIN)).toBe(0xe6);
    expect(computeVinByte('add_0x19', VIN)).toBe(0x1c);
  });

  it('decodifica chassi como Jetta Mk5 (não Eos)', () => {
    const info = decodeVinChassis(VIN);
    expect(info?.modelCode78).toBe('1K');
    expect(info?.char8).toBe('K');
    expect(info?.byte1Expected).toBe(0x3b);
    expect(info?.byte3Expected).toBe(0x0d);
    expect(info?.suggestedByte0).toBe(0x11);
    expect(info?.vehicleHint).toMatch(/Jetta V/i);
  });

  it('aplicar só VIN preenche todos os bytes derivados do chassi', () => {
    const base = createEmptyCoding('len20');
    const out = applyVinToCoding(base, VIN);
    const ref = parseHexCoding(REF)!;
    const vinIndices = [1, 3, 5, 7, 9, 11, 13];
    for (const i of vinIndices) {
      expect(out[i]).toBe(ref[i]);
    }
  });

  it('gerar do chassi + preset reproduz o long code de referência', () => {
    const base = createEmptyCoding('len20');
    const out = buildFullFromChassisForPart(base, VIN, 'CC')!;
    const rows = compareWithReference(out, REF);
    const mismatches = rows.filter((r) => !r.match);
    expect(mismatches).toEqual([]);
    expect(out.length).toBe(20);
  });
});
