import { describe, expect, it } from 'vitest';
import { decodeVinVehicleDetails } from '../src/lib/vin-vehicle';
import { decodeVinChassis } from '../src/lib/vin-decode';
import { REFERENCE_LONG_CODES } from '../src/data/reference-presets';

const VIN = REFERENCE_LONG_CODES.jettaVin;

describe('decodificação veículo só pelo chassi', () => {
  it('Jetta Mk5 México: ano, fábrica, plataforma 1K', () => {
    const v = decodeVinVehicleDetails(VIN);
    expect(v.modelYear).toBe(2010);
    expect(v.plantCode).toBe('M');
    expect(v.plantName).toMatch(/Puebla/i);
    expect(v.platformCode).toBe('1K');
    expect(v.platform).toBe('PQ35');
    expect(v.possibleModels.some((m) => /Jetta/i.test(m))).toBe(true);
    expect(v.checkDigitValid).toBe(true);
  });

  it('integra detalhes em decodeVinChassis', () => {
    const info = decodeVinChassis(VIN);
    expect(info?.vehicle.modelYear).toBe(2010);
    expect(info?.vehicle.possibleModels.length).toBeGreaterThan(0);
  });
});
