import { describe, it, expect } from 'vitest';
import { filterStrategies } from './filterStrategies';

describe('Path Testing - filterStrategies', () => {

  const testDate = new Date('2024-03-15');

  // 🔹 ALL
  it('Path 1: all → always true', () => {
    expect(filterStrategies.all()).toBe(true);
  });

  // 🔹 DATE
  it('Path 2: date → empty input', () => {
    expect(filterStrategies.date(testDate, '')).toBe(true);
  });

  it('Path 3: date → match', () => {
    expect(filterStrategies.date(testDate, '2024-03-15')).toBe(true);
  });

  it('Path 4: date → mismatch', () => {
    expect(filterStrategies.date(testDate, '2024-03-10')).toBe(false);
  });

  // 🔹 MONTH
  it('Path 5: month → empty input', () => {
    expect(filterStrategies.month(testDate, '')).toBe(true);
  });

  it('Path 6: month → match', () => {
    expect(filterStrategies.month(testDate, '2024-03')).toBe(true);
  });

  it('Path 7: month → mismatch', () => {
    expect(filterStrategies.month(testDate, '2024-04')).toBe(false);
  });

  // 🔹 YEAR
  it('Path 8: year → empty input', () => {
    expect(filterStrategies.year(testDate, '')).toBe(true);
  });

  it('Path 9: year → match', () => {
    expect(filterStrategies.year(testDate, '2024')).toBe(true);
  });

  it('Path 10: year → mismatch', () => {
    expect(filterStrategies.year(testDate, '2025')).toBe(false);
  });

});