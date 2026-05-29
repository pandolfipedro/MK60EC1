/**
 * Presets MK60EC1 — Jetta mercado brasileiro (sem ACC/PLA indevidos).
 */

import type { ProfileId } from '../lib/types';
import type { BrJettaMarketConfig } from './br-jetta-market';
import { getBrEquipmentBytes } from './br-equipment-catalog';
import { PQ35_CC_FACTORY } from './reference-presets';

export type ModuleSuffix = 'AD' | 'BL' | 'CC';

const MK5_25_BASE: Partial<Record<number, number>> = {
  0: 0x11,
  2: 0x40,
  4: 0x4a,
  6: 0x08,
};

const MK6_TSI_BASE: Partial<Record<number, number>> = {
  0: 0xa4,
  2: 0x40,
  4: 0x21,
  6: 0x08,
};

const AD_16 = 0x34;

function profileByteCount(profileId: ProfileId): number {
  const map: Record<ProfileId, number> = {
    len17: 17,
    len18: 18,
    len19: 19,
    len20: 20,
  };
  return map[profileId];
}

function suffixToProfile(suffix: ModuleSuffix): ProfileId {
  if (suffix === 'AD') return 'len17';
  if (suffix === 'BL') return 'len19';
  return 'len20';
}

function mergeEquipment(
  profileId: ProfileId,
  ...layers: Partial<Record<number, number>>[]
): number[] {
  const n = profileByteCount(profileId);
  const bytes = new Array(n).fill(0);
  const idx16 = 16;
  if (idx16 < n) {
    bytes[idx16] =
      profileId === 'len17' || profileId === 'len18' ? 0x30 : 0xa0;
  }
  for (const layer of layers) {
    for (const [k, val] of Object.entries(layer)) {
      const i = Number(k);
      if (i < n && val !== undefined) bytes[i] = val;
    }
  }
  return bytes;
}

function equipmentForConfig(
  config: BrJettaMarketConfig,
  suffix: ModuleSuffix,
): number[] {
  const profileId = suffixToProfile(suffix);
  const brTail = getBrEquipmentBytes(config, suffix);

  if (
    suffix === 'CC' &&
    config.engine === '2.5' &&
    config.generation === 'MK5' &&
    config.modelYear === 2010
  ) {
    return [...PQ35_CC_FACTORY];
  }

  const chassis =
    config.engine === 'TSI_20' || config.engine === 'FLEX_20'
      ? MK6_TSI_BASE
      : MK5_25_BASE;

  const ad16 = suffix === 'AD' ? { 16: AD_16 } : {};

  return mergeEquipment(profileId, chassis, brTail, ad16);
}

export function buildBrPresetBytes(
  config: BrJettaMarketConfig,
  suffix: ModuleSuffix,
): number[] {
  return equipmentForConfig(config, suffix);
}

export function describeBrPreset(
  config: BrJettaMarketConfig,
  suffix: ModuleSuffix,
): string {
  return `Jetta BR ${config.modelYear} · ${suffix} · sem ACC/PLA`;
}
