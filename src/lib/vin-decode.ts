import { BYTE1_VIN_PAIR, BYTE3_VIN_CHAR } from '../data/vin-maps';
import { PQ35_CC_FACTORY } from '../data/reference-presets';
import { normalizeVin, isValidVin, computeVinByte, VIN_FORMULA_BYTES } from './vin';
import { applyMirrorPairs } from './mirror';
import { applyVinToCoding } from './coding-engine';
import type { ProfileId } from './types';
import { decodeVinVehicleDetails, type VinVehicleDetails } from './vin-vehicle';
import { VAG_PLATFORM_78 } from '../data/vin-standard';
import { WMI_HINTS } from './vin-wmi';
import { applyEquipmentPreset } from './equipment-preset';

export interface VinDecodeInfo {
  vin: string;
  wmi: string;
  wmiLabel: string;
  vds: string;
  vis: string;
  modelCode78: string;
  char7: string;
  char8: string;
  vehicleHint: string;
  vehicle: VinVehicleDetails;
  suggestedByte0: number | null;
  byte1Expected: number | null;
  byte3Expected: number | null;
  vinFormulaBytes: { index: number; expected: number | null }[];
}

/** Heurística pos. 4–8 + WMI para sugerir veículo (não confundir RE no VDS com Eos). */
function inferVehicle(vin: string): { hint: string; byte0: number | null } {
  const v = vin;
  const wmi = v.slice(0, 3);
  const vds = v.slice(3, 9);
  const code78 = v.slice(6, 8);
  const pos4 = v[3];

  if (code78 === '1F') {
    return {
      hint: 'VW Eos (1F) — byte 0 típico 0x54 RoW LHD ou 0x50; confira mercado/volante',
      byte0: 0x54,
    };
  }

  if (code78 === '1K' || code78 === '5K' || code78 === 'AJ') {
    const plat = VAG_PLATFORM_78[code78];
    const isMexJetta =
      wmi === '3VW' && (vds.startsWith('RE1') || vds.startsWith('AJ5') || pos4 === 'R');
    if (isMexJetta || (wmi === '3VW' && code78 === '1K')) {
      const models = plat?.models.join(' / ') ?? 'Jetta V Mk5';
      const year = v[9];
      const brNote =
        wmi === '3VW' && (year === '9' || year === 'A' || year === 'B')
          ? ' — mercado BR: use preset Brasil'
          : '';
      return {
        hint: `VW ${models} (${plat?.platform ?? 'PQ35'}, ${code78}) — importado ${WMI_HINTS[wmi] ?? wmi}${brNote}`,
        byte0: 0x11,
      };
    }
    const models = plat?.models.join(' / ') ?? code78;
    return {
      hint: `${plat?.platform ?? 'VAG'} ${code78} — ${models}; byte 0 usual 0x11 LHD`,
      byte0: 0x11,
    };
  }
  if (code78 === '1Z') {
    return { hint: 'Škoda Octavia (1Z)', byte0: 0x11 };
  }
  if (code78 === '8P') {
    return { hint: 'Audi A3 (8P)', byte0: 0x11 };
  }
  if (code78 === '3T') {
    return { hint: 'Škoda Superb (3T)', byte0: 0x84 };
  }
  if (code78 === '5L') {
    return { hint: 'Škoda Yeti (5L)', byte0: 0x91 };
  }
  if (code78 === '16') {
    return { hint: 'VW Jetta 6 (16)', byte0: 0xa4 };
  }

  const wmiLabel = WMI_HINTS[v.slice(0, 3)] ?? 'VAG';
  return { hint: wmiLabel, byte0: 0x11 };
}

export function decodeVinChassis(vin: string): VinDecodeInfo | null {
  const v = normalizeVin(vin);
  if (!isValidVin(v)) return null;

  const { hint, byte0 } = inferVehicle(v);
  const pair78 = v.slice(6, 8);
  const char8 = v[7];
  const char7 = v[6];

  const vinFormulaBytes = VIN_FORMULA_BYTES.map(({ index, formula }) => ({
    index,
    expected: computeVinByte(formula, v),
  }));

  const vehicle = decodeVinVehicleDetails(v);

  return {
    vin: v,
    wmi: v.slice(0, 3),
    wmiLabel: WMI_HINTS[v.slice(0, 3)] ?? 'VAG',
    vds: v.slice(3, 9),
    vis: v.slice(9, 17),
    modelCode78: pair78,
    char7,
    char8,
    vehicleHint: hint,
    vehicle,
    suggestedByte0: byte0,
    byte1Expected: BYTE1_VIN_PAIR[pair78] ?? BYTE1_VIN_PAIR['1K'] ?? 0x3b,
    byte3Expected: BYTE3_VIN_CHAR[char8] ?? null,
    vinFormulaBytes,
  };
}

export interface VinApplyResult {
  bytes: number[];
  info: VinDecodeInfo;
  mismatches: { index: number; expected: number; actual: number }[];
}

/** Aplica bytes derivados do VIN + preset byte 0 + espelhos */
export function buildCodingFromVin(
  baseBytes: number[],
  vin: string,
  options?: { byte0?: number; keepOptionsBytes?: boolean },
): VinApplyResult | null {
  const info = decodeVinChassis(vin);
  if (!info) return null;

  let bytes = [...baseBytes];

  if (!options?.keepOptionsBytes) {
    if (options?.byte0 !== undefined) {
      bytes[0] = options.byte0;
    } else if (info.suggestedByte0 !== null) {
      bytes[0] = info.suggestedByte0;
    }
  }

  if (info.byte1Expected !== null) bytes[1] = info.byte1Expected;
  if (info.byte3Expected !== null) bytes[3] = info.byte3Expected;

  for (const { index, expected } of info.vinFormulaBytes) {
    if (expected !== null && index < bytes.length) bytes[index] = expected;
  }

  bytes = applyMirrorPairs(bytes);

  const mismatches: VinApplyResult['mismatches'] = [];
  for (const { index, expected } of info.vinFormulaBytes) {
    if (expected !== null && index < bytes.length && bytes[index] !== expected) {
      mismatches.push({ index, expected, actual: bytes[index] });
    }
  }

  return { bytes, info, mismatches };
}

export function compareWithReference(
  bytes: number[],
  referenceHex: string,
): { index: number; ref: string; actual: string; match: boolean }[] {
  const ref = referenceHex.replace(/[^0-9a-fA-F]/g, '');
  const rows: { index: number; ref: string; actual: string; match: boolean }[] = [];
  for (let i = 0; i < Math.max(bytes.length, ref.length / 2); i++) {
    const actual = bytes[i] !== undefined ? bytes[i].toString(16).toUpperCase().padStart(2, '0') : '—';
    const refByte = ref.slice(i * 2, i * 2 + 2).toUpperCase() || '—';
    rows.push({
      index: i,
      ref: refByte,
      actual,
      match: refByte !== '—' && actual === refByte,
    });
  }
  return rows;
}

export function applyPq35CcPreset(bytes: number[]): number[] {
  return applyEquipmentPreset(bytes, PQ35_CC_FACTORY);
}

/** @deprecated use applyPq35CcPreset */
export const applyEosCcPreset = applyPq35CcPreset;

/** Preset equipamento CC (PQ35) + bytes do VIN + espelhos */
export function buildFullFromChassis(baseBytes: number[], vin: string): number[] | null {
  if (!isValidVin(vin)) return null;
  let bytes = applyPq35CcPreset(baseBytes);
  const info = decodeVinChassis(vin);
  if (info && info.suggestedByte0 !== null) bytes[0] = info.suggestedByte0;
  bytes = applyVinToCoding(bytes, vin);
  return bytes;
}

export function detectProfileFromReference(hex: string): ProfileId | null {
  const len = hex.replace(/[^0-9a-fA-F]/g, '').length / 2;
  if (len === 17) return 'len17';
  if (len === 18) return 'len18';
  if (len === 19) return 'len19';
  if (len === 20) return 'len20';
  return null;
}
