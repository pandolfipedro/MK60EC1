import type { ProfileId } from './types';
import {
  buildBrPresetBytes,
  describeBrPreset,
  type ModuleSuffix,
} from '../data/br-presets';
import {
  isBrImportJettaCandidate,
  resolveBrJettaMarket,
  type BrJettaMarketConfig,
} from '../data/br-jetta-market';
import { applyEquipmentPreset } from './equipment-preset';
import { applyVinToCoding } from './coding-engine';
import { isValidVin, normalizeVin } from './vin';
import { parsePartNumber } from './part-numbers';
import { applyPq35CcPreset, decodeVinChassis } from './vin-decode';

export type { ModuleSuffix };

export interface BrApplyResult {
  bytes: number[];
  config: BrJettaMarketConfig;
  moduleSuffix: ModuleSuffix;
  description: string;
}

export function moduleSuffixFromPart(partQuery: string): ModuleSuffix | null {
  const p = parsePartNumber(partQuery);
  if (!p) return null;
  const s = p.suffix.toUpperCase();
  if (s === 'AD' || s === 'BL' || s === 'CC') return s;
  return null;
}

export function buildBrCodingFromVin(
  baseBytes: number[],
  vin: string,
  moduleSuffix: ModuleSuffix,
): BrApplyResult | null {
  const config = resolveBrJettaMarket(vin);
  if (!config) return null;

  const preset = buildBrPresetBytes(config, moduleSuffix);
  let bytes = applyEquipmentPreset(baseBytes, preset);

  if (config.engine === '2.5' && config.generation === 'MK5') {
    bytes[0] = 0x11;
  } else if (config.engine === 'TSI_20') {
    bytes[0] = config.platformCode === '16' ? 0xa4 : 0x11;
  }

  bytes = applyVinToCoding(bytes, vin);

  return {
    bytes,
    config,
    moduleSuffix,
    description: describeBrPreset(config, moduleSuffix),
  };
}

/** Preset BR + VIN, ou fallback PQ35/CC genérico */
export function buildFullFromChassisForPart(
  baseBytes: number[],
  vin: string,
  partQuery: string,
): number[] | null {
  if (!isValidVin(vin)) return null;
  const suffix = moduleSuffixFromPart(partQuery) ?? 'CC';

  if (isBrImportJettaCandidate(normalizeVin(vin))) {
    const br = buildBrCodingFromVin(baseBytes, vin, suffix);
    if (br) return br.bytes;
  }

  let bytes = applyPq35CcPreset(baseBytes);
  const info = decodeVinChassis(vin);
  if (info && info.suggestedByte0 !== null) bytes[0] = info.suggestedByte0;
  return applyVinToCoding(bytes, vin);
}

export function getBrMarketPreview(vin: string): BrJettaMarketConfig | null {
  if (!isBrImportJettaCandidate(vin.toUpperCase())) return null;
  return resolveBrJettaMarket(vin);
}

export function profileIdForModule(suffix: ModuleSuffix): ProfileId {
  if (suffix === 'AD') return 'len17';
  if (suffix === 'BL') return 'len19';
  return 'len20';
}
