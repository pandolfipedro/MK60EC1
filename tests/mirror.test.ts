import { describe, expect, it } from 'vitest';
import { applyMirrorPairs, bitMirrorByte } from '../src/lib/mirror';

describe('bitMirrorByte', () => {
  it('espelha A0 para 05 (lprot)', () => {
    expect(bitMirrorByte(0xa0)).toBe(0x05);
  });

  it('é involutivo', () => {
    for (let i = 0; i < 256; i++) {
      expect(bitMirrorByte(bitMirrorByte(i))).toBe(i);
    }
  });
});

describe('applyMirrorPairs', () => {
  it('atualiza bytes 8,10,12,14', () => {
    const bytes = new Array(17).fill(0);
    bytes[0] = 0x11;
    bytes[2] = 0x60;
    const out = applyMirrorPairs(bytes);
    expect(out[8]).toBe(bitMirrorByte(0x11));
    expect(out[10]).toBe(bitMirrorByte(0x60));
  });
});
