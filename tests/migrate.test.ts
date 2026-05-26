import { describe, expect, it } from 'vitest';
import { migrateAtToBm, migrateBcToAd } from '../src/lib/migrate';
import { formatHexCoding, parseHexCoding } from '../src/lib/coding-engine';

describe('migrateBcToAd', () => {
  it('caso lprot BC→AD', () => {
    const input = '114B400C492300FD880B02E8921A0041B700';
    const bytes = parseHexCoding(input)!;
    const { bytes: out } = migrateBcToAd(bytes);
    const hex = formatHexCoding(out);
    expect(hex).toBe('114B400C492300FD880B02E8921A00413400');
    expect(out.length).toBe(18);
  });
});

describe('migrateAtToBm', () => {
  it('caso lprot AT→BM', () => {
    const input = '113B200D092300FD880C04E8902000513500';
    const bytes = parseHexCoding(input)!;
    expect(bytes.length).toBe(18);
    const { bytes: out } = migrateAtToBm(bytes);
    expect(out.length).toBe(19);
    const hex = formatHexCoding(out);
    expect(hex.endsWith('12')).toBe(true);
    expect(hex).toContain('41A1');
  });
});
