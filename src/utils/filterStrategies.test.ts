// src/utils/filterStrategies.test.ts
import { describe, it, expect } from 'vitest';
import { filterStrategies } from './filterStrategies';

describe('Filter Strategies Logic', () => {
  it('should correctly match a specific month', () => {
    const testDate = new Date('2024-03-15');
    // Result should be true for March
    expect(filterStrategies.month(testDate, '2024-03')).toBe(true);
    // Result should be false for April
    expect(filterStrategies.month(testDate, '2024-04')).toBe(false);
  });
});