/**
 * Bytes de equipamento/PR (não derivados só do VIN).
 * Exemplo: Jetta Mk5 PQ35, 1K0907379CC, VIN 3VWRE11K3AM137623.
 */
export const PQ35_CC_FACTORY: number[] = [
  0x11, 0x00, 0x40, 0x00, 0x4a, 0x00, 0x00, 0x00, 0x88, 0x00, 0x02, 0x00, 0x52, 0x00, 0x00,
  0x41, 0xe1, 0x08, 0x00, 0x60,
];

/** @deprecated use PQ35_CC_FACTORY */
export const EOS_CC_FACTORY = PQ35_CC_FACTORY;

export const REFERENCE_LONG_CODES = {
  /** Long code de fábrica CC + chassi Jetta Mk5 (3VW, 1K) */
  jettaCc: '113B400D4A250001881102E6521C0041E1080060',
  jettaVin: '3VWRE11K3AM137623',
  /** aliases antigos */
  eosCc: '113B400D4A250001881102E6521C0041E1080060',
  eosVin: '3VWRE11K3AM137623',
} as const;
