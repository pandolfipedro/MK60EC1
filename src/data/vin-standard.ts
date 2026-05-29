/** Ano-modelo — posição 10 (padrão norte-americano, usado pela VW globalmente). */
export const VIN_MODEL_YEAR: Record<string, number> = {
  A: 2010,
  B: 2011,
  C: 2012,
  D: 2013,
  E: 2014,
  F: 2015,
  G: 2016,
  H: 2017,
  J: 2018,
  K: 2019,
  L: 2020,
  M: 2021,
  N: 2022,
  P: 2023,
  R: 2024,
  S: 2025,
  T: 2026,
  V: 1997,
  W: 1998,
  X: 1999,
  Y: 2000,
  '1': 2001,
  '2': 2002,
  '3': 2003,
  '4': 2004,
  '5': 2005,
  '6': 2006,
  '7': 2007,
  '8': 2008,
  '9': 2009,
};

/** Fábricas VW frequentes — posição 11 (incompleto; varia por época). */
export const VAG_PLANT_CODES: Record<string, string> = {
  M: 'Puebla, México (Jetta/Bora, etc.)',
  B: 'Wolfsburg, Alemanha',
  K: 'Osnabrück / Emden (histórico)',
  N: 'Zwickau / Neckarsulm (Audi/VW)',
  P: 'Mosel (Brasil, alguns modelos)',
  S: 'Salzgitter / componentes',
  W: 'Wolfsburg (alternativo)',
  X: 'Poznań / outros VAG',
  '0': 'Bratislava (VW/Skoda)',
};

/** Plataforma / família — posições 7–8 do VIN (código interno VAG). */
export const VAG_PLATFORM_78: Record<
  string,
  { platform: string; models: string[]; generation?: string }
> = {
  '1K': {
    platform: 'PQ35',
    models: ['Golf V', 'Jetta V (Mk5)', 'Jetta V Variant', 'Golf Plus'],
    generation: '2003–2013',
  },
  '5K': {
    platform: 'PQ35',
    models: ['Golf VI', 'Jetta VI (início)'],
    generation: '2008–2013',
  },
  '1F': { platform: 'PQ35', models: ['Eos'], generation: '2006–2015' },
  '1Z': { platform: 'PQ34/PQ35', models: ['Octavia II'], generation: '2004–2013' },
  '8P': { platform: 'PQ34', models: ['Audi A3 8P'], generation: '2003–2013' },
  '3T': { platform: 'PQ46', models: ['Superb II'], generation: '2008–2015' },
  '5L': { platform: 'PQ35', models: ['Yeti'], generation: '2009–2017' },
  '16': { platform: 'PQ35/PQ46', models: ['Jetta VI (NAR)', 'Jetta 6'], generation: '2011+' },
  'AJ': { platform: 'PQ35', models: ['Golf VI cabrio / derivados'], generation: '2008+' },
};

/** Pesos transliteração para dígito verificador ISO 3779 */
const VIN_TRANSLITERATION: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
};

const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export function vinCheckDigitValue(ch: string): number {
  if (ch >= '0' && ch <= '9') return parseInt(ch, 10);
  return VIN_TRANSLITERATION[ch] ?? 0;
}

/** Calcula dígito verificador esperado (pos. 9). */
export function computeVinCheckDigit(vin: string): string {
  const v = vin.toUpperCase();
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    if (i === 8) continue;
    sum += vinCheckDigitValue(v[i]) * VIN_WEIGHTS[i];
  }
  const rem = sum % 11;
  return rem === 10 ? 'X' : String(rem);
}

export function isVinCheckDigitValid(vin: string): boolean {
  if (vin.length !== 17) return false;
  return vin[8] === computeVinCheckDigit(vin);
}
