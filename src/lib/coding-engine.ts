import { PROFILES, profileFromByteCount } from '../data/profiles';
import type {
  ByteDef,
  CodingProfile,
  DecodedByte,
  ProfileId,
  ValidationIssue,
} from './types';
import {
  applyMirrorPairs,
  bitMirrorByte,
  mirrorIssues,
  toBinaryByte,
  toHexByte,
} from './mirror';
import { applyVinBytes, isValidVin, normalizeVin, VIN_FORMULA_BYTES } from './vin';

export function parseHexCoding(input: string): number[] | null {
  const hex = input.replace(/[^0-9a-fA-F]/g, '');
  if (hex.length === 0 || hex.length % 2 !== 0) return null;
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return bytes;
}

export function formatHexCoding(bytes: number[], spaced = false): string {
  const parts = bytes.map((b) => toHexByte(b));
  return spaced ? parts.join(' ') : parts.join('');
}

export function detectProfile(bytes: number[]): ProfileId | null {
  return profileFromByteCount(bytes.length);
}

export function createEmptyCoding(profileId: ProfileId): number[] {
  const profile = PROFILES[profileId];
  const bytes = new Array(profile.byteCount).fill(0);
  const idx16 = 16;
  if (idx16 < bytes.length) {
    bytes[idx16] = parseInt(profile.defaultByte16, 16);
  }
  return bytes;
}

export function applyVinToCoding(bytes: number[], vin: string): number[] {
  if (!isValidVin(vin)) return bytes;
  let out = applyVinBytes(bytes, vin, VIN_FORMULA_BYTES);
  out = applyMirrorPairs(out);
  return out;
}

export function setByte(bytes: number[], index: number, value: number): number[] {
  const out = [...bytes];
  if (index < 0 || index >= out.length) return out;
  out[index] = value & 0xff;
  return applyMirrorPairs(out);
}

function describeBitfield(value: number, def: ByteDef): string {
  if (!def.bits?.length) return `0x${toHexByte(value)}`;
  const exact = def.bits.filter((b) => (value & b.mask) === b.mask && b.mask !== 0);
  if (exact.length > 0) {
    return exact.map((m) => m.label).join(' · ');
  }
  const active: string[] = [];
  for (const b of def.bits) {
    if (b.mask && (value & b.mask) === b.mask) active.push(b.label);
  }
  return active.length ? active.join(' · ') : `0x${toHexByte(value)}`;
}

function describeEnum(value: number, def: ByteDef): string {
  const hex = toHexByte(value);
  const opt = def.values?.find((v) => v.hex.toUpperCase() === hex);
  return opt ? `${hex} — ${opt.label}` : `${hex} — valor desconhecido`;
}

export function decodeByte(value: number, def: ByteDef | undefined): string {
  if (!def) return toHexByte(value);
  switch (def.type) {
    case 'mirror_of':
      return `Espelho de byte ${def.mirrorSource}`;
    case 'vin_formula':
      return `Derivado do VIN (${def.label})`;
    case 'bitfield':
      return describeBitfield(value, def);
    case 'enum':
      return describeEnum(value, def);
    case 'reserved':
      return `${toHexByte(value)} (reservado)`;
    default:
      return toHexByte(value);
  }
}

export function decodeCoding(
  bytes: number[],
  profileId?: ProfileId,
): { profile: CodingProfile | null; decoded: DecodedByte[] } {
  const pid = profileId ?? detectProfile(bytes);
  if (!pid) return { profile: null, decoded: [] };

  const profile = PROFILES[pid];
  const decoded: DecodedByte[] = [];

  for (let i = 0; i < bytes.length; i++) {
    const def = profile.bytes.find((b) => b.index === i);
    const warnings: string[] = [];
    if (def?.type === 'mirror_of' && def.mirrorSource !== undefined) {
      const src = bytes[def.mirrorSource];
      if (src !== undefined && bytes[i] !== bitMirrorByte(src)) {
        warnings.push(
          `Espelho incorreto (esperado ${toHexByte(bitMirrorByte(src))})`,
        );
      }
    }
    decoded.push({
      index: i,
      hex: toHexByte(bytes[i]),
      binary: toBinaryByte(bytes[i]),
      description: decodeByte(bytes[i], def),
      warnings,
    });
  }

  for (const msg of mirrorIssues(bytes)) {
    const m = msg.match(/Byte (\d+)/);
    if (m) {
      const idx = parseInt(m[1], 10);
      const row = decoded.find((d) => d.index === idx);
      if (row && !row.warnings.includes(msg)) row.warnings.push(msg);
    }
  }

  return { profile, decoded };
}

export function validateCoding(
  bytes: number[],
  vin?: string,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const profile = detectProfile(bytes);

  if (!profile) {
    issues.push({
      level: 'error',
      message: `Comprimento inválido: ${bytes.length} bytes (esperado 17–20).`,
    });
    return issues;
  }

  issues.push({
    level: 'info',
    message: `Perfil: ${PROFILES[profile].label}`,
  });

  for (const msg of mirrorIssues(bytes)) {
    issues.push({ level: 'warning', message: msg });
  }

  if (vin) {
    const v = normalizeVin(vin);
    if (!isValidVin(v)) {
      issues.push({ level: 'error', message: 'VIN inválido (17 caracteres, sem I/O/Q).' });
    } else {
      issues.push({
        level: 'info',
        message:
          'Use o VIN do módulo 17 (painel) se diferir do chassi — o ABS valida contra o painel.',
      });
      const expected = applyVinToCoding(createEmptyCoding(profile), v);
      for (const { index } of VIN_FORMULA_BYTES) {
        if (index < bytes.length && bytes[index] !== expected[index]) {
          issues.push({
            level: 'warning',
            message: `Byte ${index}: ${toHexByte(bytes[index])} ≠ VIN (${toHexByte(expected[index])}).`,
          });
        }
      }
    }
  }

  const idx16 = 16;
  if (idx16 < bytes.length) {
    const b16 = bytes[idx16];
    if (profile === 'len17' || profile === 'len18') {
      if (b16 !== 0x30) {
        issues.push({
          level: 'warning',
          message: 'Byte 16: valor seguro inicial costuma ser 0x30 até o módulo aceitar.',
        });
      }
    } else if (b16 !== 0xa0) {
      issues.push({
        level: 'warning',
        message: 'Byte 16: valor seguro inicial costuma ser 0xA0 em módulos 19–20 bytes.',
      });
    }
  }

  return issues;
}
