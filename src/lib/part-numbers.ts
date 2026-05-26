import partNumbersJson from '../data/part-numbers.json';
import vinWhitelist from '../data/vin-whitelist.json';
import type { PartNumberEntry, ProfileId } from './types';
import { normalizeVin } from './vin';

export const PART_NUMBERS = partNumbersJson as PartNumberEntry[];

export function findPartBySuffix(suffix: string): PartNumberEntry | undefined {
  const s = suffix.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return PART_NUMBERS.find((p) => p.suffix.toUpperCase() === s);
}

export function parsePartNumber(input: string): PartNumberEntry | undefined {
  const cleaned = input.toUpperCase().replace(/\s/g, '');
  const match = cleaned.match(/907379([A-Z]{1,2})$/);
  if (!match) return undefined;
  return findPartBySuffix(match[1]);
}

export function checkVinWhitelist(
  vin: string,
  suffix: string,
): { ok: boolean; message?: string } {
  const v = normalizeVin(vin);
  if (v.length !== 17) return { ok: false, message: 'VIN inválido' };

  const modelCode = v.slice(6, 8);
  const suf = suffix.toUpperCase();

  for (const [group, models] of Object.entries(vinWhitelist)) {
    const suffixes = group.split(',').map((x) => x.trim());
    if (suffixes.some((s) => suf === s || suf.endsWith(s))) {
      if (models.includes(modelCode)) return { ok: true };
      return {
        ok: false,
        message: `VIN pos. 7–8 (${modelCode}) pode não ser compatível com módulo ${suffix}. Permitidos: ${models.join(', ')}`,
      };
    }
  }

  return { ok: true, message: 'Suffix não está na whitelist etz2k — verifique manualmente.' };
}

export function profileByteCount(id: ProfileId): number {
  const map: Record<ProfileId, number> = {
    len17: 17,
    len18: 18,
    len19: 19,
    len20: 20,
  };
  return map[id];
}
