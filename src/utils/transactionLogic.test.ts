import { describe, it, expect } from 'vitest';
import { transactionPath } from './transactionLogic';

describe('Path Testing - Transaction Logic', () => {

  // 🔴 Path 1: Invalid amount
  it('Path 1: amount <= 0 → invalid', () => {
    expect(transactionPath(0, {}, null)).toBe('invalid');
  });

  // 🔴 Path 2: No user
  it('Path 2: user is null → invalid', () => {
    expect(transactionPath(100, null, null)).toBe('invalid');
  });

  // 🟡 Path 3: Update path
  it('Path 3: editingId exists → update', () => {
    expect(transactionPath(100, {}, '123')).toBe('update');
  });

  // 🟢 Path 4: Add path
  it('Path 4: new record → add', () => {
    expect(transactionPath(100, {}, null)).toBe('add');
  });

});