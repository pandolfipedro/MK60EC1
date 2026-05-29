import { VIN_FORMULA_BYTES } from './vin';

const VIN_DERIVED_INDICES = new Set(VIN_FORMULA_BYTES.map((f) => f.index));

/** Preenche bytes de equipamento (não sobrescreve índices derivados do VIN). */
export function applyEquipmentPreset(bytes: number[], preset: number[]): number[] {
  const out = [...bytes];
  for (let i = 0; i < Math.min(out.length, preset.length); i++) {
    if (!VIN_DERIVED_INDICES.has(i)) out[i] = preset[i];
  }
  return out;
}
