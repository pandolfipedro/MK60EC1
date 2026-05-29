/**
 * Regras de mercado — Jetta importado no Brasil (PQ35, México 3VW).
 */

import { VIN_MODEL_YEAR } from './vin-standard';
import { detectBrBodyFromVin } from './br-vds-hints';

export type BrEngine = '2.5' | 'TSI_20' | 'FLEX_20';
export type BrBody = 'SEDAN' | 'VARIANT';
export type BrGeneration = 'MK5' | 'MK6';

export interface BrJettaMarketConfig {
  market: 'BR';
  modelYear: number;
  generation: BrGeneration;
  body: BrBody;
  bodyDetectHint: string;
  bodyConfidence: 'alta' | 'media' | 'baixa';
  engine: BrEngine;
  platformCode: string;
  label: string;
  rationale: string[];
  engineConfidence: 'alta' | 'media' | 'baixa';
}

function yearFromVin(vin: string): number | null {
  return VIN_MODEL_YEAR[vin[9]] ?? null;
}

function inferGeneration(platform: string, year: number, body: BrBody): BrGeneration {
  if (platform === '16' || platform === '5K') return 'MK6';
  if (year >= 2011 && platform !== '1K' && body === 'SEDAN') return 'MK6';
  if (year >= 2011 && body === 'VARIANT') return 'MK5';
  return 'MK5';
}

function inferEngine(
  vin: string,
  year: number,
  body: BrBody,
  generation: BrGeneration,
  platform: string,
): { engine: BrEngine; confidence: BrJettaMarketConfig['engineConfidence']; notes: string[] } {
  const notes: string[] = [];
  const vds = vin.slice(3, 9);

  if (body === 'VARIANT') {
    notes.push('Jetta Variant no BR: desde abril/2008, motor 2.5 Tiptronic (até linha Mk6 do sedã).');
    if (year <= 2013) {
      return { engine: '2.5', confidence: 'alta', notes };
    }
    notes.push('Variant antiga no BR era 2.5; confira motor no cofre.');
    return { engine: '2.5', confidence: 'media', notes };
  }

  if (year <= 2010) {
    notes.push('Jetta sedã BR: só 2.5 20V (EA855) + Tiptronic neste período.');
    return { engine: '2.5', confidence: 'alta', notes };
  }

  if (generation === 'MK6' || platform === '16') {
    if (year >= 2012) {
      notes.push('Jetta 6 sedã: 2.0 TSI (Highline) ou 2.0 Flex (Comfortline).');
      return { engine: 'TSI_20', confidence: 'baixa', notes };
    }
    if (vds.startsWith('RE1') || platform === '1K') {
      notes.push('Sedã 2011 ainda pode ser 2.5 (estoque Mk5) — ou Mk6 novo; veja plataforma e motor.');
      return { engine: '2.5', confidence: 'media', notes };
    }
    notes.push('Sedã 2011 Mk6: Highline 2.0 TSI + DSG disponível no BR.');
    return { engine: 'TSI_20', confidence: 'media', notes };
  }

  if (year === 2011) {
    if (vds.startsWith('RE1') || platform === '1K') {
      return { engine: '2.5', confidence: 'alta', notes };
    }
    return { engine: 'TSI_20', confidence: 'media', notes };
  }

  notes.push('Confira motor no cofre (5 cilindros = 2.5; turbo 4 cil. = TSI).');
  return { engine: '2.5', confidence: 'baixa', notes };
}

export function isBrImportJettaCandidate(vin: string): boolean {
  const wmi = vin.slice(0, 3);
  const platform = vin.slice(6, 8);
  if (!['3VW', '9BW', 'WVW'].includes(wmi)) return false;
  if (!['1K', '5K', '16', 'AJ'].includes(platform)) return false;
  const year = yearFromVin(vin);
  if (year === null || year < 2005 || year > 2016) return false;
  return true;
}

export function resolveBrJettaMarket(
  vin: string,
  bodyOverride?: BrBody,
): BrJettaMarketConfig | null {
  const v = vin.toUpperCase();
  if (v.length !== 17) return null;
  if (!isBrImportJettaCandidate(v)) return null;

  const modelYear = yearFromVin(v)!;
  const platformCode = v.slice(6, 8);
  const detected = detectBrBodyFromVin(v, modelYear);
  const body = bodyOverride ?? detected.body;
  const generation = inferGeneration(platformCode, modelYear, body);
  const { engine, confidence, notes } = inferEngine(
    v,
    modelYear,
    body,
    generation,
    platformCode,
  );

  const bodyLabel = body === 'VARIANT' ? 'Variant (perua)' : 'Sedã';
  const genLabel =
    body === 'VARIANT' && modelYear <= 2010
      ? 'Mk5 perua'
      : generation === 'MK5'
        ? 'Mk5'
        : 'Mk6';

  const engineLabel =
    engine === '2.5'
      ? '2.5 20V EA855'
      : engine === 'TSI_20'
        ? '2.0 TSI'
        : '2.0 Flex EA113';

  const label = `Jetta ${bodyLabel} ${genLabel} ${modelYear} — ${engineLabel} (BR)`;

  const rationale = [
    `Importado (${v.slice(0, 3)}), plataforma ${platformCode}, ano ${modelYear}.`,
    bodyOverride ? `Carroceria escolhida manualmente: ${bodyLabel}.` : detected.hint,
    ...notes,
  ];

  if (engine === 'TSI_20' && modelYear <= 2010) {
    rationale.push('TSI no sedã/Variant BR até 2010 não existia — revise chassi ou motor.');
  }

  if (body === 'VARIANT' && modelYear < 2008) {
    rationale.push('Variant BR começou em 2008 — ano do VIN parece anterior.');
  }

  return {
    market: 'BR',
    modelYear,
    generation,
    body,
    bodyDetectHint: detected.hint,
    bodyConfidence: bodyOverride ? 'alta' : detected.confidence,
    engine,
    platformCode,
    label,
    rationale,
    engineConfidence: confidence,
  };
}
