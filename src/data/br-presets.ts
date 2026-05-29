/**
 * Presets de equipamento MK60EC1 — Jetta mercado brasileiro.
 * Bytes VIN (1,3,5,7,9,11,13) são sempre aplicados depois.
 */

import type { ProfileId } from '../lib/types';
import type { BrJettaMarketConfig } from './br-jetta-market';
import { PQ35_CC_FACTORY } from './reference-presets';

export type ModuleSuffix = 'AD' | 'BL' | 'CC';

/** Equipamento comum Jetta PQ35 BR 2.5 / sedã importado */
const MK5_25_EQUIP: Partial<Record<number, number>> = {
  0: 0x11,
  2: 0x40,
  4: 0x4a,
  6: 0x08,
  15: 0x41,
};

/** Mk6 2.0 TSI sedã — valores base; validar no veículo */
const MK6_TSI_EQUIP: Partial<Record<number, number>> = {
  0: 0xa4,
  2: 0x40,
  4: 0x21,
  6: 0x08,
  15: 0x41,
};

const MODULE_TAIL: Record<
  ModuleSuffix,
  Partial<Record<number, number>>
> = {
  AD: {
    16: 0x34,
  },
  BL: {
    16: 0xa1,
    17: 0x08,
    18: 0x00,
  },
  CC: {
    16: 0xe1,
    17: 0x08,
    18: 0x00,
    19: 0x60,
  },
};

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
      profileId === 'len17' || profileId === 'len18'
        ? parseInt('30', 16)
        : parseInt('A0', 16);
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

  let base: Partial<Record<number, number>>;
  if (config.engine === 'TSI_20' || config.engine === 'FLEX_20') {
    base = { ...MK6_TSI_EQUIP };
  } else {
    base = { ...MK5_25_EQUIP };
  }

  if (config.generation === 'MK5' && config.engine === '2.5') {
    base = { ...MK5_25_EQUIP };
  }

  if (suffix === 'CC' && config.engine === '2.5' && config.generation === 'MK5') {
    return [...PQ35_CC_FACTORY];
  }

  return mergeEquipment(profileId, base, MODULE_TAIL[suffix]);
}

export function buildBrPresetBytes(
  config: BrJettaMarketConfig,
  suffix: ModuleSuffix,
): number[] {
  return equipmentForConfig(config, suffix);
}

export function describeBrPreset(config: BrJettaMarketConfig, suffix: ModuleSuffix): string {
  const lines = [
    `Preset BR: ${config.label}`,
    `Módulo ${suffix} (${suffixToProfile(suffix)}, ${profileByteCount(suffixToProfile(suffix))} bytes)`,
  ];
  if (config.engine === '2.5') {
    lines.push('EDS2 (byte 15), freios FN3 288mm, Jetta NAR byte 6, sem TSI.');
  } else {
    lines.push('Perfil Mk6/TSI — revise bytes 0 e 4 no veículo.');
  }
  return lines.join(' · ');
}
