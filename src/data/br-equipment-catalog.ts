/**
 * Equipamentos reais do Jetta no Brasil (importado).
 */

import type { BrJettaMarketConfig } from './br-jetta-market';

export interface BrEquipmentSheet {
  title: string;
  has: string[];
  notHas: string[];
  optional: string[];
  verify: string[];
}

const SHARED_NOT_HAS = [
  'ACC — piloto que mantém distância do carro da frente',
  'PLA — estacionamento automático',
  'Motor 2.0 TSI turbo (até 2010 no BR)',
  'Câmbio DSG (perua e sedã Mk5 usavam Tiptronic)',
];

const MK5_25_SEDAN: BrEquipmentSheet = {
  title: 'Jetta sedã Mk5 2.5 (2005–2010 no BR)',
  has: [
    'Motor 2.5 cinco cilindros, 170 cv',
    'Tiptronic 6 marchas',
    'ABS, ESP, controle de tração',
    'Piloto automático comum',
    'Ar-condicionado, direção hidráulica',
    'Airbags frontais e laterais',
  ],
  notHas: [
    ...SHARED_NOT_HAS,
    'Carroceria perua — se for Variant, escolha «Perua» no app',
  ],
  optional: ['Teto solar', 'Xenon', 'Rodas 17"', 'Bancos elétricos', 'Sensor de estacionamento'],
  verify: [
    'Traseira baixa (sedã), não perua',
    'Cofre: motor 5 cilindros em linha',
    'Painel: piloto comum, sem ACC',
  ],
};

const MK5_25_VARIANT: BrEquipmentSheet = {
  title: 'Jetta Variant Mk5 2.5 (2008–2010 no BR)',
  has: [
    'Motor 2.5 cinco cilindros, 170 cv (igual ao sedã)',
    'Tiptronic 6 marchas',
    'ABS, ESP, airbags (até 7 airbags na época)',
    'Piloto automático comum',
    'Rodas 17" e porta-malas ~505 l (perua)',
    'Lançamento BR: abril de 2008',
  ],
  notHas: [...SHARED_NOT_HAS],
  optional: [
    'Teto solar / panorâmico (reestilizado 2010)',
    'Xenon',
    'Sensores de estacionamento dianteiro (série em 2010+)',
  ],
  verify: [
    'Carroceria perua (porta-malas alto)',
    'Cofre: mesmo 2.5 EA855 do sedã',
    'Não é sedã Jetta «normal»',
  ],
};

const MK5_VARIANT_2011: BrEquipmentSheet = {
  title: 'Jetta Variant 2.5 (2011 no BR)',
  has: [
    'Motor 2.5, Tiptronic',
    'Perua Mk5 ainda no mercado enquanto sedã virou Mk6',
  ],
  notHas: [...SHARED_NOT_HAS, 'Sedã Mk6 TSI — isso é outro carro'],
  optional: ['Teto panorâmico', 'Xenon', 'Tela multimídia (2010+)'],
  verify: ['Perua + motor 5 cilindros'],
};

const MK6_TSI_SEDAN: BrEquipmentSheet = {
  title: 'Jetta sedã Mk6 Highline 2.0 TSI (2011+ no BR)',
  has: [
    'Motor 2.0 TSI ~200 cv',
    'Câmbio DSG 6 marchas',
    'ESP, piloto comum, climatronic 2 zonas',
    'Couro, sensores chuva/crepuscular (Highline)',
  ],
  notHas: [
    'ACC (só em Jetta bem mais novo, ex. GLI recente)',
    'Motor 2.5 cinco cilindros',
    'PLA de série',
  ],
  optional: ['GPS', 'Teto solar'],
  verify: ['Sedã novo 2011+', 'Motor 2.0 turbo 4 cilindros'],
};

const MK6_FLEX_SEDAN: BrEquipmentSheet = {
  title: 'Jetta sedã Mk6 Comfortline 2.0 Flex (2011+ no BR)',
  has: [
    'Motor 2.0 Flex',
    'Manual ou automático (não DSG na entrada)',
    'ABS, ESP, piloto comum',
  ],
  notHas: ['ACC', 'TSI turbo', 'Motor 2.5', 'DSG na versão base'],
  optional: ['Câmbio automático'],
  verify: ['Motor 2.0 sem turbo grande'],
};

export function getBrEquipmentSheet(config: BrJettaMarketConfig): BrEquipmentSheet {
  if (config.body === 'VARIANT') {
    if (config.modelYear <= 2010) {
      return {
        ...MK5_25_VARIANT,
        title: `Jetta Variant 2.5 ${config.modelYear} (BR)`,
      };
    }
    if (config.modelYear === 2011) return MK5_VARIANT_2011;
    return {
      ...MK5_25_VARIANT,
      title: `Jetta Variant ${config.modelYear} (BR)`,
    };
  }

  if (config.generation === 'MK5' && config.engine === '2.5') {
    return {
      ...MK5_25_SEDAN,
      title: `Jetta sedã 2.5 ${config.modelYear} (BR)`,
    };
  }
  if (config.engine === 'TSI_20') {
    return { ...MK6_TSI_SEDAN, title: `Jetta sedã TSI ${config.modelYear} (BR)` };
  }
  if (config.engine === 'FLEX_20') {
    return { ...MK6_FLEX_SEDAN, title: `Jetta sedã 2.0 Flex ${config.modelYear} (BR)` };
  }
  return MK5_25_SEDAN;
}

export function getBrEquipmentBytes(
  config: BrJettaMarketConfig,
  suffix: 'AD' | 'BL' | 'CC',
): Partial<Record<number, number>> {
  const isMk5_25 = config.engine === '2.5' && config.generation === 'MK5';

  const base: Partial<Record<number, number>> = { 15: 0x41 };

  if (isMk5_25) {
    const out: Partial<Record<number, number>> = {
      ...base,
      16: suffix === 'AD' ? 0x34 : 0xa1,
      17: 0x00,
      18: 0x00,
    };
    if (suffix === 'BL') out[19] = 0x20;
    if (suffix === 'CC' && config.modelYear !== 2010) {
      out[16] = 0xa1;
      out[19] = 0x20;
    }
    return out;
  }

  if (config.engine === 'TSI_20') {
    return {
      ...base,
      0: 0xa4,
      16: 0xb0,
      17: 0x00,
      18: 0x00,
      19: suffix === 'CC' ? 0x20 : undefined,
    };
  }

  return { ...base, 16: 0xb0, 17: 0x00, 18: 0x00 };
}

export function getBrCodingPlainSummary(
  config: BrJettaMarketConfig,
  suffix: 'AD' | 'BL' | 'CC',
): string[] {
  const lines = [
    'ACC (piloto adaptativo): DESLIGADO — correto para Jetta BR até ~2018',
    'PLA: DESLIGADO',
  ];
  if (config.body === 'VARIANT') {
    lines.push('Variant BR: mesmo 2.5 e Tiptronic do sedã (Mk5)');
  }
  if (config.engine === '2.5') {
    lines.push('Motor: EDS2 (2.5)');
    lines.push(
      config.body === 'VARIANT'
        ? 'Freios: FN3 288 mm (perua importada)'
        : 'Freios: FN3 288 mm (sedã)',
    );
  }
  if (suffix === 'BL' || suffix === 'CC') {
    lines.push('HHC: ligado se módulo tiver sensor G251');
  }
  return lines;
}
