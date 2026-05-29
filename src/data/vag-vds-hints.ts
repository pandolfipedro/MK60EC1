/**
 * Heurísticas VDS (pos. 4–6) + WMI — só offline, confiança variável.
 * VINs europeus (WVWZZZ…) usam Z de preenchimento; NA/México codificam motor/série.
 */

export type VinConfidence = 'alta' | 'media' | 'baixa';

export interface VdsHint {
  label: string;
  confidence: VinConfidence;
  note?: string;
}

/** 3VW + VDS conhecidos — Jetta Mk5 México / NAR */
const MEX_VDS_HINTS: Record<string, VdsHint> = {
  RE1: {
    label: 'Jetta sedan (geração PQ35, fábrica México)',
    confidence: 'media',
    note: 'Padrão comum 3VW + 1K; confirme com pos. 11 (M = Puebla)',
  },
  AJ5: {
    label: 'Jetta / derivado PQ35',
    confidence: 'media',
  },
};

export function hintFromVds(wmi: string, vds456: string, code78: string): VdsHint | null {
  if (wmi === '3VW') {
    const key3 = vds456.slice(0, 3);
    if (MEX_VDS_HINTS[key3]) return MEX_VDS_HINTS[key3];
    if (code78 === '1K') {
      return {
        label: 'VW PQ35 — provável Golf V / Jetta V (Mk5)',
        confidence: 'media',
        note: 'Pos. 4–6 variam por motor/mercado; use 7–8 (1K) como âncora',
      };
    }
  }

  if (wmi === 'WVW' && vds456.includes('ZZZ')) {
    return {
      label: 'VIN europeu (ZZZ preenchimento na pos. 4–6)',
      confidence: 'baixa',
      note: 'Modelo exato exige lista PR/ETKA ou API; 7–8 ainda ajudam',
    };
  }

  return null;
}
