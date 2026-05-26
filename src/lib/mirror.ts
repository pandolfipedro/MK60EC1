/** Bit-reverse within one byte (VAG "bit mirror" / checksum mirror). */
export function bitMirrorByte(b: number): number {
  let out = 0;
  for (let i = 0; i < 8; i++) {
    if (b & (1 << i)) out |= 1 << (7 - i);
  }
  return out & 0xff;
}

export function toHexByte(n: number): string {
  return n.toString(16).toUpperCase().padStart(2, '0');
}

export function toBinaryByte(n: number): string {
  return n.toString(2).padStart(8, '0');
}

export const MIRROR_PAIRS: ReadonlyArray<[number, number]> = [
  [0, 8],
  [2, 10],
  [4, 12],
  [6, 14],
];

export function applyMirrorPairs(bytes: number[]): number[] {
  const out = [...bytes];
  for (const [src, dst] of MIRROR_PAIRS) {
    if (src < out.length && dst < out.length) {
      out[dst] = bitMirrorByte(out[src]);
    }
  }
  return out;
}

export function mirrorIssues(bytes: number[]): string[] {
  const issues: string[] = [];
  for (const [src, dst] of MIRROR_PAIRS) {
    if (src >= bytes.length || dst >= bytes.length) continue;
    const expected = bitMirrorByte(bytes[src]);
    if (bytes[dst] !== expected) {
      issues.push(
        `Byte ${dst} (${toHexByte(bytes[dst])}) deveria ser espelho de byte ${src} (${toHexByte(bytes[src])}) → ${toHexByte(expected)}`,
      );
    }
  }
  return issues;
}
