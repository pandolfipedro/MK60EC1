/**
 * Heurísticas VDS (pos. 4–9) para sedã vs Variant no BR.
 * Não é oficial VW — use conferência visual (porta-malas alto = Variant).
 */

import type { BrBody } from './br-jetta-market';

export type BodyDetectConfidence = 'alta' | 'media' | 'baixa';

export interface BodyDetectResult {
  body: BrBody;
  confidence: BodyDetectConfidence;
  hint: string;
}

/** Prefixos VDS associados a perua / SportWagen / Variant (México → BR) */
const VARIANT_VDS_PREFIXES = ['AJ', 'AV', 'AU', 'WM'];

/** Sedã Jetta BR importado (RE1 + 1K muito comum) */
const SEDAN_VDS_PREFIXES = ['RE1', 'RE2'];

export function detectBrBodyFromVin(vin: string, modelYear: number): BodyDetectResult {
  const vds = vin.slice(3, 9);

  if (vds.includes('VAR') || vds.startsWith('SW')) {
    return {
      body: 'VARIANT',
      confidence: 'alta',
      hint: 'VDS indica perua/Variant.',
    };
  }

  for (const p of VARIANT_VDS_PREFIXES) {
    if (vds.startsWith(p)) {
      return {
        body: 'VARIANT',
        confidence: 'media',
        hint: `VDS «${vds}» — padrão comum de Jetta Variant / perua (BR desde 2008).`,
      };
    }
  }

  for (const p of SEDAN_VDS_PREFIXES) {
    if (vds.startsWith(p)) {
      return {
        body: 'SEDAN',
        confidence: 'alta',
        hint: `VDS «${vds}» — sedã Jetta importado.`,
      };
    }
  }

  if (modelYear >= 2008 && modelYear <= 2010 && vds[2] === 'W') {
    return {
      body: 'VARIANT',
      confidence: 'media',
      hint: 'Ano 2008–2010 + VDS com «W» — pode ser Variant (perua).',
    };
  }

  return {
    body: 'SEDAN',
    confidence: 'baixa',
    hint:
      'Não deu para saber só pelo VIN. Olhe o carro: porta-malas alto = Variant; sedã traseira baixa = sedã.',
  };
}
