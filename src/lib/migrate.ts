import type { MigrationResult, MigrationStep, ProfileId } from './types';
import { parsePartNumber } from './part-numbers';
import { profileFromByteCount } from '../data/profiles';
import { applyMirrorPairs, toHexByte } from './mirror';
import { parseHexCoding } from './coding-engine';

function step(
  steps: MigrationStep[],
  bytes: number[],
  index: number,
  after: number,
  reason: string,
): void {
  const before = bytes[index];
  if (before === after) return;
  bytes[index] = after;
  steps.push({
    byteIndex: index,
    before: toHexByte(before),
    after: toHexByte(after),
    reason,
  });
}

function clearBit(bytes: number[], index: number, bit: number, reason: string, steps: MigrationStep[]): void {
  step(steps, bytes, index, bytes[index] & ~bit, reason);
}

function setBit(bytes: number[], index: number, bit: number, reason: string, steps: MigrationStep[]): void {
  step(steps, bytes, index, bytes[index] | bit, reason);
}

function padEnd(bytes: number[], targetLen: number, steps: MigrationStep[], reason: string): void {
  while (bytes.length < targetLen) {
    bytes.push(0);
    steps.push({
      byteIndex: bytes.length - 1,
      before: '—',
      after: '00',
      reason,
    });
  }
}

function truncate(bytes: number[], targetLen: number, steps: MigrationStep[], reason: string): void {
  while (bytes.length > targetLen) {
    const removed = bytes.pop()!;
    steps.push({
      byteIndex: bytes.length,
      before: toHexByte(removed),
      after: '—',
      reason,
    });
  }
}

/** lprot caso 2: BC (18B) → AD (17B) */
export function migrateBcToAd(bytes: number[]): MigrationResult {
  const steps: MigrationStep[] = [];
  const warnings: string[] = [
    'Flash recomendado: 1K0907379CD_0120.sgo. Faça log de adaptações 03 e 44 antes.',
  ];
  if (bytes.length > 18) {
    truncate(bytes, 18, steps, 'Remover bytes extras além de 18');
  }
  if (bytes.length === 18) {
    truncate(bytes, 17, steps, 'Remover último 0x00 antes de adaptar para AD (17B)');
  }
  if (bytes.length >= 17) {
    clearBit(bytes, 16, 0x01, 'AD sem HHC — desligar bit 0 byte 16', steps);
    clearBit(bytes, 16, 0x02, 'AD sem SET MFA TPMS — desligar bit 1 byte 16', steps);
    step(steps, bytes, 16, 0x34, 'MCB no bit 4 + ajuste AD (byte 16 = 0x34)');
  } else if (bytes.length === 16) {
    padEnd(bytes, 17, steps, 'Completar com 0x00 final (formato AD 17B)');
  }
  const mirrored = applyMirrorPairs(bytes);
  if (mirrored.length >= 17 && mirrored[15] === 0x41 && mirrored[16] === 0x34) {
    padEnd(mirrored, 18, steps, 'Acrescentar 0x00 final (exemplo lprot AD)');
  }
  return { bytes: mirrored, steps, warnings };
}

/** lprot caso 3: AT (18B) → BM (19B) */
export function migrateAtToBm(bytes: number[]): MigrationResult {
  const steps: MigrationStep[] = [];
  const warnings: string[] = [
    'Flash recomendado: 1K0907379CC_0175.sgo. RDW/7K6 agora no byte 19.',
  ];
  padEnd(bytes, 19, steps, 'BM+ usa 19 bytes — acrescentar 0x00');
  clearBit(bytes, 15, 0x10, 'Bit 4 byte 15 = Start-Stop em BM+ (não CBC)', steps);
  clearBit(bytes, 16, 0x04, 'RDW/7K6 migra para byte 19 — desligar bit 2 byte 16', steps);
  clearBit(bytes, 16, 0x10, 'MCB em AT no bit 4 — desligar', steps);
  setBit(bytes, 16, 0x80, 'MCB em BM+ no bit 7 byte 16', steps);
  step(steps, bytes, 18, (bytes[18] & 0xf0) | 0x12, 'Byte 19: RDKS+ e botão ESC (0x12)');
  return { bytes: applyMirrorPairs(bytes), steps, warnings };
}

/** etz2k: 18 → 19 bytes (+00, remap byte 16 bit 7) */
export function migrate18To19(bytes: number[]): MigrationResult {
  const steps: MigrationStep[] = [];
  const warnings: string[] = [];
  padEnd(bytes, 19, steps, '18→19: acrescentar byte 0x00');
  if (bytes[16] & 0x80) {
    clearBit(bytes, 16, 0x80, 'Bit 7 byte 16 mudou (iTPMS) — desligar salvo NIRA', steps);
    warnings.push('Se usar NIRA iTPMS, reconfigure byte 16/19 manualmente.');
  }
  return { bytes: applyMirrorPairs(bytes), steps, warnings };
}

/** etz2k: 18 → 20 bytes (CC) */
export function migrate18To20(bytes: number[]): MigrationResult {
  const steps: MigrationStep[] = [];
  const warnings: string[] = ['Migração para CC (20B) exige revisão manual de bytes 17–19.'];
  padEnd(bytes, 20, steps, '18→20: acrescentar 0000');
  clearBit(bytes, 6, 0x80, 'ESP off agora no byte 19', steps);
  clearBit(bytes, 14, 0x01, 'Desligar espelho ESP off byte 14', steps);
  clearBit(bytes, 16, 0x02, 'Funções movidas para byte 19', steps);
  clearBit(bytes, 16, 0x04, 'Funções movidas para byte 19', steps);
  clearBit(bytes, 16, 0x08, 'Funções movidas para byte 19', steps);
  clearBit(bytes, 16, 0x10, 'Funções movidas para byte 19', steps);
  setBit(bytes, 16, 0x80, 'MCB: ligar bit 7 se sem MKB', steps);
  clearBit(bytes, 17, 0x10, 'AWV byte 17 bit 4 mudou em CC', steps);
  warnings.push('Configure byte 19: variante iTPMS e botão ESC.');
  return { bytes: applyMirrorPairs(bytes), steps, warnings };
}

/** etz2k: 19 → 20 */
export function migrate19To20(bytes: number[]): MigrationResult {
  const steps: MigrationStep[] = [];
  const warnings: string[] = [];
  padEnd(bytes, 20, steps, '19→20: acrescentar um byte 0x00');
  const cc = migrate18To20(bytes);
  return {
    bytes: cc.bytes,
    steps: [...steps, ...cc.steps],
    warnings: [...warnings, ...cc.warnings],
  };
}

export function migrateCoding(
  hexInput: string,
  oldSuffix: string,
  newSuffix: string,
): MigrationResult | { error: string } {
  const bytes = parseHexCoding(hexInput);
  if (!bytes) return { error: 'Long code hex inválido' };

  const oldPart = findPartBySuffixLocal(oldSuffix);
  const newPart = findPartBySuffixLocal(newSuffix);
  const oldLen = bytes.length;
  const newProfile = newPart?.profile ?? profileFromByteCount(oldLen);

  const steps: MigrationStep[] = [];
  const warnings: string[] = [];
  const work = [...bytes];

  const os = oldSuffix.toUpperCase();
  const ns = newSuffix.toUpperCase();

  if (os === 'BC' && ns === 'AD') {
    return migrateBcToAd(work);
  }
  if (os === 'AT' && ns === 'BM') {
    return migrateAtToBm(work);
  }

  const oldP = oldPart?.profile ?? profileFromByteCount(oldLen);
  const newP = newPart?.profile ?? newProfile;

  if (!oldP || !newP) {
    return { error: 'Não foi possível determinar perfil pelos part numbers' };
  }

  const rank: Record<ProfileId, number> = { len17: 17, len18: 18, len19: 19, len20: 20 };
  const o = rank[oldP];
  const n = rank[newP];

  if (n === o) {
    warnings.push('Mesmo comprimento de coding — apenas ajuste opções manualmente.');
    return { bytes: applyMirrorPairs(work), steps, warnings };
  }

  if (n === 19 && o === 18) return migrate18To19(work);
  if (n === 20 && o === 18) return migrate18To20(work);
  if (n === 20 && o === 19) return migrate19To20(work);

  if (n < o) {
    truncate(work, n, steps, `Downgrade ${o}→${n} bytes — verifique compatibilidade`);
    warnings.push('Downgrade de firmware: alto risco. Faça backup.');
    return { bytes: applyMirrorPairs(work), steps, warnings };
  }

  return { error: `Migração ${oldP}→${newP} não automatizada. Use regras etz2k manualmente.` };
}

function findPartBySuffixLocal(suffix: string) {
  return parsePartNumber(`1K0907379${suffix}`) ?? parsePartNumber(suffix);
}
