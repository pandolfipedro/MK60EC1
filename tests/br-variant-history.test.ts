import { describe, expect, it } from 'vitest';
import { getBrEquipmentSheet } from '../src/data/br-equipment-catalog';
import { resolveBrJettaMarket } from '../src/data/br-jetta-market';
import { detectBrBodyFromVin } from '../src/data/br-vds-hints';
import { REFERENCE_LONG_CODES } from '../src/data/reference-presets';

describe('Jetta Variant BR desde 2008', () => {
  it('Variant 2009 com body manual: 2.5 alta confiança', () => {
    const vin = REFERENCE_LONG_CODES.jettaVin.slice(0, 9) + '9' + REFERENCE_LONG_CODES.jettaVin.slice(10);
    const c = resolveBrJettaMarket(vin, 'VARIANT')!;
    expect(c.modelYear).toBe(2009);
    expect(c.body).toBe('VARIANT');
    expect(c.engine).toBe('2.5');
    const sheet = getBrEquipmentSheet(c);
    expect(sheet.has.some((h) => /2008|perua/i.test(h))).toBe(true);
    expect(sheet.notHas.some((n) => /Variant.*não/i.test(n))).toBe(false);
  });

  it('sedã 2010 não diz que Variant não existe', () => {
    const c = resolveBrJettaMarket(REFERENCE_LONG_CODES.jettaVin)!;
    expect(c.body).toBe('SEDAN');
    const sheet = getBrEquipmentSheet(c);
    expect(sheet.notHas.some((n) => n.includes('Variant (perua)') && n.startsWith('Jetta'))).toBe(
      false,
    );
  });

  it('VDS AJ sugere perua', () => {
    const vin = `3VWAJ51K3A${REFERENCE_LONG_CODES.jettaVin.slice(10)}`;
    const r = detectBrBodyFromVin(vin, 2009);
    expect(r.body).toBe('VARIANT');
  });
});
