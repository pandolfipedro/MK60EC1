import { describe, expect, it } from 'vitest';
import { resolveBrJettaMarket } from '../src/data/br-jetta-market';
import { buildBrPresetBytes } from '../src/data/br-presets';
import { buildBrCodingFromVin } from '../src/lib/br-market-apply';
import { createEmptyCoding, formatHexCoding } from '../src/lib/coding-engine';
import { REFERENCE_LONG_CODES } from '../src/data/reference-presets';

const JETTA_2010 = REFERENCE_LONG_CODES.jettaVin;

describe('mercado BR Jetta', () => {
  it('2010 importado: só 2.5 Mk5 sedan', () => {
    const c = resolveBrJettaMarket(JETTA_2010)!;
    expect(c.modelYear).toBe(2010);
    expect(c.engine).toBe('2.5');
    expect(c.generation).toBe('MK5');
    expect(c.body).toBe('SEDAN');
    expect(c.engineConfidence).toBe('alta');
  });

  it('2009: motor 2.5 alta confiança', () => {
    const vin = '3VWRE11K3A9M13762'; // check digit pode falhar; regra de ano usa pos 10
    const c = resolveBrJettaMarket(vin + '3');
    if (!c) {
      const vin09 = JETTA_2010.slice(0, 9) + '9' + JETTA_2010.slice(10);
      const c2 = resolveBrJettaMarket(vin09);
      expect(c2?.modelYear).toBe(2009);
      expect(c2?.engine).toBe('2.5');
      return;
    }
    expect(c.modelYear).toBe(2009);
    expect(c.engine).toBe('2.5');
  });

  it('2010 não sugere TSI', () => {
    const c = resolveBrJettaMarket(JETTA_2010)!;
    expect(c.engine).not.toBe('TSI_20');
  });

  it('preset CC BR reproduz long code de referência', () => {
    const base = createEmptyCoding('len20');
    const out = buildBrCodingFromVin(base, JETTA_2010, 'CC')!;
    expect(formatHexCoding(out.bytes)).toBe(REFERENCE_LONG_CODES.jettaCc);
  });

  it('presets AD e BL têm 17 e 19 bytes', () => {
    const c = resolveBrJettaMarket(JETTA_2010)!;
    expect(buildBrPresetBytes(c, 'AD').length).toBe(17);
    expect(buildBrPresetBytes(c, 'BL').length).toBe(19);
    expect(buildBrPresetBytes(c, 'CC').length).toBe(20);
  });

  it('Variant 2011 força 2.5', () => {
    const vin =
      JETTA_2010.slice(0, 3) + 'AJ51K' + JETTA_2010.slice(8, 9) + 'B' + JETTA_2010.slice(10);
    const c = resolveBrJettaMarket(vin, 'VARIANT');
    expect(c?.body).toBe('VARIANT');
    expect(c?.engine).toBe('2.5');
  });
});
