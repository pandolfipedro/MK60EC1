export type ProfileId = 'len17' | 'len18' | 'len19' | 'len20';

export type ByteType =
  | 'vin_formula'
  | 'bitfield'
  | 'mirror_of'
  | 'enum'
  | 'reserved';

export type VinFormula =
  | 'byte1_map'
  | 'byte3_map'
  | 'add_0x22'
  | 'add_0xFA'
  | 'add_0x0B'
  | 'add_0xE4'
  | 'add_0x19';

export interface BitOption {
  mask: number;
  label: string;
  pr?: string;
}

export interface EnumOption {
  hex: string;
  label: string;
  pr?: string;
}

export interface ByteDef {
  index: number;
  label: string;
  type: ByteType;
  vinIndex?: number;
  formula?: VinFormula;
  mirrorSource?: number;
  bits?: BitOption[];
  values?: EnumOption[];
  minProfile?: ProfileId;
  help?: string;
}

export interface CodingProfile {
  id: ProfileId;
  byteCount: number;
  label: string;
  hwFamilies: string[];
  defaultByte16: string;
  bytes: ByteDef[];
}

export interface PartNumberEntry {
  suffix: string;
  profile: ProfileId;
  hw: string;
  label: string;
  hasG251?: boolean;
}

export interface DecodedByte {
  index: number;
  hex: string;
  binary: string;
  description: string;
  warnings: string[];
}

export interface ValidationIssue {
  level: 'error' | 'warning' | 'info';
  message: string;
}

export interface MigrationStep {
  byteIndex: number;
  before: string;
  after: string;
  reason: string;
}

export interface MigrationResult {
  bytes: number[];
  steps: MigrationStep[];
  warnings: string[];
}
