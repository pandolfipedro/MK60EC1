/**
 * Mapas VIN → bytes de coding (lprot + BrianOConner333).
 * Byte 1: par VIN pos. 7–8 (índices 6–7) → valor HEX gravado no byte 1.
 * Byte 3: caractere VIN pos. 8 (índice 7) → valor HEX no byte 3.
 */

/** Par pos. 7–8 do VIN → byte 1 (valor hex no long code, ex.: 3B, 1K→3B) */
export const BYTE1_VIN_PAIR: Record<string, number> = {
  '3B': 0x3b,
  '3C': 0x3c,
  '3D': 0x3d,
  '3F': 0x3f,
  '42': 0x42,
  '4B': 0x4b,
  '50': 0x50,
  '55': 0x55,
  '58': 0x58,
  '5D': 0x5d,
  // Plataforma PQ35 / códigos de modelo mais comuns (7–8 no VIN)
  '1K': 0x3b,
  '5K': 0x3b,
  'AJ': 0x3b,
  '1Z': 0x3b,
  '8P': 0x3b,
  '1P': 0x3b,
  '5P': 0x3b,
  '5L': 0x3b,
  '2K': 0x3b,
  '1F': 0x3b,
  '13': 0x3b,
  '3T': 0x3b,
  '1T': 0x3b,
  '16': 0x3b,
  'AT': 0x3b,
  '5C': 0x3b,
  'A3': 0x3b,
};

/** Pos. 8 do VIN (índice 7) → byte 3 */
export const BYTE3_VIN_CHAR: Record<string, number> = {
  '3': 0xf5,
  '4': 0xf6,
  '5': 0xf7,
  '6': 0xf8,
  F: 0x08,
  H: 0x0a,
  J: 0x0c,
  K: 0x0d,
  L: 0x0e,
  M: 0x0f,
  P: 0x12,
  T: 0x16,
  Z: 0x1c,
  A: 0x03,
  B: 0x04,
  C: 0x05,
  D: 0x06,
  E: 0x07,
};

/** Byte 0 — valores lprot (modelo + GTHC + volante) */
export const BYTE0_PRESETS: { hex: string; label: string; vin78?: string }[] = [
  { hex: '11', label: 'Golf/Jetta/Leon/Octavia/A3 (1K/1Z/8P/1P) LHD', vin78: '1K' },
  { hex: '13', label: 'Golf/Jetta/Leon/Octavia (1K…) RHD', vin78: '1K' },
  { hex: '14', label: 'GTI/GTD/vRS/Cupra LHD', vin78: '1K' },
  { hex: '16', label: 'GTI/GTD/vRS/Cupra RHD', vin78: '1K' },
  { hex: '50', label: 'VW Eos (1F)', vin78: '1F' },
  { hex: '54', label: 'VW Eos RoW LHD', vin78: '1F' },
  { hex: '56', label: 'VW Eos RoW RHD', vin78: '1F' },
  { hex: '91', label: 'Skoda Yeti (5L) LHD' },
  { hex: '84', label: 'Skoda Superb (3T) LHD' },
  { hex: '32', label: 'VW Touran (1T) LHD' },
  { hex: '42', label: 'VW Caddy (2K) LHD' },
  { hex: 'A4', label: 'Jetta 6 RoW (16) LHD' },
  { hex: 'E4', label: 'Beetle RoW (16) LHD' },
];
