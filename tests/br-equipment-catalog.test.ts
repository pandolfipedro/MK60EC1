import { describe, expect, it } from 'vitest';
import { getBrEquipmentSheet } from '../src/data/br-equipment-catalog';
import { resolveBrJettaMarket } from '../src/data/br-jetta-market';
import { buildBrPresetBytes } from '../src/data/br-presets';
import { REFERENCE_LONG_CODES } from '../src/data/reference-presets';

describe('catálogo equipamento BR', () => {
  const vin = REFERENCE_LONG_CODES.jettaVin;

  it('Mk5 2010 lista sem ACC e sem TSI', () => {
    const config = resolveBrJettaMarket(vin)!;
    const sheet = getBrEquipmentSheet(config);
    expect(sheet.notHas.some((s) => /ACC/i.test(s))).toBe(true);
    expect(sheet.notHas.some((s) => /TSI/i.test(s))).toBe(true);
    expect(sheet.has.some((s) => /Tiptronic/i.test(s))).toBe(true);
  });

  it('preset BL Mk5 deixa byte 17 sem PLA/ACC (00)', () => {
    const config = resolveBrJettaMarket(vin)!;
    const bytes = buildBrPresetBytes(config, 'BL');
    expect(bytes[17]).toBe(0x00);
    expect(bytes[16] & 0x20).toBe(0x20);
  });

  it('preset CC 2010 mantém referência de fábrica', () => {
    const config = resolveBrJettaMarket(vin)!;
    const bytes = buildBrPresetBytes(config, 'CC');
    expect(bytes.length).toBe(20);
    expect(bytes[16] & 0x20).toBe(0x20);
  });
});
