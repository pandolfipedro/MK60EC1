/**
 * Regras de mercado — Jetta importado no Brasil (PQ35, México 3VW).
 * Fontes: fichas técnicas BR (Heycar, iCarros, Wikipedia BR), lineup histórico.
 *
 * Limitação: motor/versão raramente estão explícitos no VIN público;
 * usamos ano-modelo + plataforma 7–8 + heurísticas VDS.
 */

import { VIN_MODEL_YEAR } from './vin-standard';

export type BrEngine = '2.5' | 'TSI_20' | 'FLEX_20';
export type BrBody = 'SEDAN' | 'VARIANT';
export type BrGeneration = 'MK5' | 'MK6';

export interface BrJettaMarketConfig {
  market: 'BR';
  modelYear: number;
  generation: BrGeneration;
  body: BrBody;
  engine: BrEngine;
  platformCode: string;
  label: string;
  /** Texto para UI / avisos */
  rationale: string[];
  /** Confiança da inferência de motor */
  engineConfidence: 'alta' | 'media' | 'baixa';
}

function yearFromVin(vin: string): number | null {
  return VIN_MODEL_YEAR[vin[9]] ?? null;
}

/** Variant BR: VDS costuma usar AJ* / AV* em 3VW (heurística, não oficial VW). */
function inferBody(vin: string, year: number): BrBody {
  const vds = vin.slice(3, 9);
  if (vds.startsWith('AJ') || vds.startsWith('AV') || vds.includes('VAR')) {
    return 'VARIANT';
  }
  if (year >= 2011 && (vds[2] === 'W' || vds.startsWith('AU'))) {
    return 'VARIANT';
  }
  return 'SEDAN';
}

function inferGeneration(platform: string, year: number): BrGeneration {
  if (platform === '16' || platform === '5K') return 'MK6';
  if (year >= 2011 && platform !== '1K') return 'MK6';
  return 'MK5';
}

/**
 * Motor vendido no Brasil (importado México/Europa).
 * - Até 2010: só 2.5 20V (Mk5 sedan).
 * - 2011 Variant: só 2.5.
 * - 2011 sedan: entra 2.0 TSI Highline; RE1+1K continua 2.5.
 * - 2012+: Jetta 6 — TSI 2.0 e 2.5 até descontinuar; Flex 2.0 em versões locais.
 */
function inferEngine(
  vin: string,
  year: number,
  body: BrBody,
  generation: BrGeneration,
  platform: string,
): { engine: BrEngine; confidence: BrJettaMarketConfig['engineConfidence']; notes: string[] } {
  const notes: string[] = [];
  const vds = vin.slice(3, 9);

  if (year <= 2010) {
    notes.push('Até 2010 o Jetta BR importado foi somente 2.5 20V (EA855).');
    return { engine: '2.5', confidence: 'alta', notes };
  }

  if (body === 'VARIANT') {
    if (year === 2011) {
      notes.push('Jetta Variant 2011 no BR: versão única 2.5 Tiptronic.');
      return { engine: '2.5', confidence: 'alta', notes };
    }
    if (year <= 2013) {
      notes.push('Variant importada: predominantemente 2.5; confira motor físico.');
      return { engine: '2.5', confidence: 'media', notes };
    }
  }

  if (generation === 'MK6' || platform === '16') {
    if (year >= 2012) {
      notes.push('Jetta 6 BR: TSI 2.0 ou 2.5; Flex 2.0 em algumas versões — confira etiqueta motor.');
      return { engine: 'TSI_20', confidence: 'baixa', notes };
    }
    if (vds.startsWith('RE1') || platform === '1K') {
      notes.push('Sedan 2011 com plataforma 1K / VDS RE1: mantido 2.5 no México para BR.');
      return { engine: '2.5', confidence: 'alta', notes };
    }
    notes.push('Sedan 2011 Mk6: linha 2.0 TSI Highline disponível no BR.');
    return { engine: 'TSI_20', confidence: 'media', notes };
  }

  if (year === 2011 && body === 'SEDAN') {
    if (vds.startsWith('RE1') || platform === '1K') {
      notes.push('Jetta 2011 sedan importado (1K): na maioria 2.5; TSI só em versões Mk6/16.');
      return { engine: '2.5', confidence: 'alta', notes };
    }
    return { engine: 'TSI_20', confidence: 'media', notes };
  }

  notes.push('Não foi possível cruzar motor só pelo VIN — use 2.5 se Mk5 ou leia o motor.');
  return { engine: '2.5', confidence: 'baixa', notes };
}

export function isBrImportJettaCandidate(vin: string): boolean {
  const wmi = vin.slice(0, 3);
  const platform = vin.slice(6, 8);
  if (!['3VW', '9BW', 'WVW'].includes(wmi)) return false;
  if (!['1K', '5K', '16', 'AJ'].includes(platform)) return false;
  const year = yearFromVin(vin);
  if (year === null || year < 2008 || year > 2016) return false;
  return true;
}

export function resolveBrJettaMarket(vin: string): BrJettaMarketConfig | null {
  const v = vin.toUpperCase();
  if (v.length !== 17) return null;
  if (!isBrImportJettaCandidate(v)) return null;

  const modelYear = yearFromVin(v)!;
  const platformCode = v.slice(6, 8);
  const body = inferBody(v, modelYear);
  const generation = inferGeneration(platformCode, modelYear);
  const { engine, confidence, notes } = inferEngine(v, modelYear, body, generation, platformCode);

  const bodyLabel = body === 'VARIANT' ? 'Variant' : 'Sedan';
  const genLabel = generation === 'MK5' ? 'Mk5 (PQ35)' : 'Mk6';
  const engineLabel =
    engine === '2.5'
      ? '2.5 20V EA855'
      : engine === 'TSI_20'
        ? '2.0 TSI'
        : '2.0 Flex EA113';

  const label = `Jetta ${genLabel} ${bodyLabel} ${modelYear} — ${engineLabel} (BR)`;

  const rationale = [
    `WMI ${v.slice(0, 3)}: importado (México/Europa).`,
    `Plataforma VIN 7–8: ${platformCode} (${genLabel}).`,
    `Ano-modelo pos. 10 «${v[9]}» → ${modelYear}.`,
    ...notes,
  ];

  if (engine === 'TSI_20' && modelYear <= 2010) {
    rationale.push('⚠ TSI em 2010 não foi homologado no BR — revise o chassi.');
  }

  return {
    market: 'BR',
    modelYear,
    generation,
    body,
    engine,
    platformCode,
    label,
    rationale,
    engineConfidence: confidence,
  };
}
