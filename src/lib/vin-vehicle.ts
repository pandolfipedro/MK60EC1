import {
  VAG_PLANT_CODES,
  VAG_PLATFORM_78,
  VIN_MODEL_YEAR,
  computeVinCheckDigit,
  isVinCheckDigitValid,
} from '../data/vin-standard';
import { hintFromVds, type VinConfidence } from '../data/vag-vds-hints';
import { WMI_HINTS } from './vin-wmi';

export interface VinVehicleDetails {
  manufacturer: string;
  region: string;
  modelYear: number | null;
  modelYearChar: string;
  plantCode: string;
  plantName: string | null;
  platformCode: string;
  platform: string | null;
  possibleModels: string[];
  generation: string | null;
  vds456: string;
  vdsHint: string | null;
  vdsConfidence: VinConfidence | null;
  serialNumber: string;
  checkDigit: string;
  checkDigitValid: boolean;
  checkDigitExpected: string;
  /** O que NÃO dá para saber só pelo chassi */
  notDecodableOffline: string[];
}

export function decodeVinVehicleDetails(vin: string): VinVehicleDetails {
  const wmi = vin.slice(0, 3);
  const vds456 = vin.slice(3, 6);
  const code78 = vin.slice(6, 8);
  const yearChar = vin[9];
  const plantCode = vin[10];
  const serial = vin.slice(11, 17);

  const plat = VAG_PLATFORM_78[code78];
  const vdsH = hintFromVds(wmi, vds456, code78);

  const notDecodableOffline = [
    'Motor / cilindrada exata (pos. 5–6 NA; na Europa costuma ser Z)',
    'Versão comercial (Trendline, Sport, GLI, TDI…)',
    'Câmbio DSG vs manual',
    'Lista PR completa (ABS, ACC, xenon…)',
    'Mercado de homologação (exceto indícios por WMI/fábrica)',
  ];

  return {
    manufacturer: WMI_HINTS[wmi]?.split('(')[0].trim() ?? 'VAG',
    region: WMI_HINTS[wmi] ?? 'Desconhecido',
    modelYear: VIN_MODEL_YEAR[yearChar] ?? null,
    modelYearChar: yearChar,
    plantCode,
    plantName: VAG_PLANT_CODES[plantCode] ?? null,
    platformCode: code78,
    platform: plat?.platform ?? null,
    possibleModels: plat?.models ?? [],
    generation: plat?.generation ?? null,
    vds456,
    vdsHint: vdsH?.label ?? null,
    vdsConfidence: vdsH?.confidence ?? null,
    serialNumber: serial,
    checkDigit: vin[8],
    checkDigitValid: isVinCheckDigitValid(vin),
    checkDigitExpected: computeVinCheckDigit(vin),
    notDecodableOffline: notDecodableOffline,
  };
}
