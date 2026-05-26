import type { CodingProfile, ProfileId } from '../lib/types';
import {
  SHARED_BYTES,
  BYTE_15,
  BYTE_16,
  BYTE_17,
  BYTE_18,
  BYTE_19,
} from './byte-definitions';

const PROFILE_META: Record<
  ProfileId,
  { byteCount: number; label: string; hwFamilies: string[]; defaultByte16: string }
> = {
  len17: {
    byteCount: 17,
    label: '17 bytes (AD/AE/AN/AP – H35/H45)',
    hwFamilies: ['H35', 'H45'],
    defaultByte16: '30',
  },
  len18: {
    byteCount: 18,
    label: '18 bytes (AH–BJ, 2K, 3T – H30/H35/H45)',
    hwFamilies: ['H30', 'H35', 'H45'],
    defaultByte16: '30',
  },
  len19: {
    byteCount: 19,
    label: '19 bytes (BK/BL/AR – H31)',
    hwFamilies: ['H31'],
    defaultByte16: 'A0',
  },
  len20: {
    byteCount: 20,
    label: '20 bytes (BM/CC – H46)',
    hwFamilies: ['H46'],
    defaultByte16: 'A0',
  },
};

function buildProfile(id: ProfileId): CodingProfile {
  const meta = PROFILE_META[id];
  const bytes = [...SHARED_BYTES, BYTE_15, BYTE_16];
  if (id !== 'len17') bytes.push(BYTE_17);
  if (id === 'len19' || id === 'len20') bytes.push(BYTE_18);
  if (id === 'len19' || id === 'len20') bytes.push(BYTE_19);
  return { id, ...meta, bytes };
}

export const PROFILES: Record<ProfileId, CodingProfile> = {
  len17: buildProfile('len17'),
  len18: buildProfile('len18'),
  len19: buildProfile('len19'),
  len20: buildProfile('len20'),
};

export const PROFILE_ORDER: ProfileId[] = ['len17', 'len18', 'len19', 'len20'];

export function profileFromByteCount(n: number): ProfileId | null {
  if (n === 17) return 'len17';
  if (n === 18) return 'len18';
  if (n === 19) return 'len19';
  if (n === 20) return 'len20';
  return null;
}
