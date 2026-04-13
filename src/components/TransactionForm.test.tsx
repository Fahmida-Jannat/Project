import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransactionForm from './TransactionForm';

describe('Whitebox Testing - TransactionForm Component', () => {
  const mockProps = {
    type: 'income' as 'income' | 'expense',
    setType: vi.fn(),
    amount: 100,
    setAmount: vi.fn(),
    category: 'Salary',
    setCategory: vi.fn(),
    description: 'Monthly salary',
    setDescription: vi.fn(),
    date: '2024-03-15',
    setDate: vi.fn(),
    onProcess: vi.fn(),
    editingId: null,
    onCancel: vi.fn(),
  };

  // 🟢 Path 1: Add mode (editingId is null)
  it('Path 1: Add mode - renders Quick Add title and Confirm button', () => {
    render(<TransactionForm {...mockProps} />);
    
    expect(screen.getByText('Quick Add')).toBeInTheDocument();
    expect(screen.getByText('Confirm income')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  // 🟡 Path 2: Edit mode (editingId is set)
  it('Path 2: Edit mode - renders Edit Record title, Update button, and Cancel button', () => {
    render(<TransactionForm {...mockProps} editingId="123" />);
    
    expect(screen.getByText('Edit Record')).toBeInTheDocument();
    expect(screen.getByText('Update income')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  // 🔵 Path 3: Type toggle - income active
  it('Path 3: Type toggle - income button active, expense inactive', () => {
    render(<TransactionForm {...mockProps} />);
    
    const incomeBtn = screen.getByText('Income');
    const expenseBtn = screen.getByText('Expense');
    
    expect(incomeBtn).toHaveClass('active');
    expect(expenseBtn).not.toHaveClass('active');
  });

  // 🔵 Path 4: Type toggle - expense active
  it('Path 4: Type toggle - expense button active, income inactive', () => {
    render(<TransactionForm {...mockProps} type="expense" />);
    
    const incomeBtn = screen.getByText('Income');
    const expenseBtn = screen.getByText('Expense');
    
    expect(expenseBtn).toHaveClass('active');
    expect(incomeBtn).not.toHaveClass('active');
  });

  // 🟠 Path 5: Type toggle click changes type
  it('Path 5: Clicking expense button calls setType with expense', () => {
    render(<TransactionForm {...mockProps} />);
    
    const expenseBtn = screen.getByText('Expense');
    fireEvent.click(expenseBtn);
    
    expect(mockProps.setType).toHaveBeenCalledWith('expense');
  });

  // 🟠 Path 6: Amount input change
  it('Path 6: Amount input calls setAmount on change', () => {
    render(<TransactionForm {...mockProps} />);
    
    const amountInput = screen.getByPlaceholderText('Amount (৳)');
    fireEvent.change(amountInput, { target: { value: '200' } });
    
    expect(mockProps.setAmount).toHaveBeenCalledWith(200);
  });

  // 🟠 Path 7: Category input change
  it('Path 7: Category input calls setCategory on change', () => {
    render(<TransactionForm {...mockProps} />);
    
    const categoryInput = screen.getByPlaceholderText('Category (e.g., Food, Salary)');
    fireEvent.change(categoryInput, { target: { value: 'Food' } });
    
    expect(mockProps.setCategory).toHaveBeenCalledWith('Food');
  });

  // 🟠 Path 8: Description input change
  it('Path 8: Description input calls setDescription on change', () => {
    render(<TransactionForm {...mockProps} />);
    
    const descInput = screen.getByPlaceholderText('Description');
    fireEvent.change(descInput, { target: { value: 'Lunch' } });
    
    expect(mockProps.setDescription).toHaveBeenCalledWith('Lunch');
  });

  // 🟠 Path 9: Date input change
  it('Path 9: Date input calls setDate on change', () => {
    render(<TransactionForm {...mockProps} />);
    
    const dateInput = screen.getByDisplayValue('2024-03-15');
    fireEvent.change(dateInput, { target: { value: '2024-03-20' } });
    
    expect(mockProps.setDate).toHaveBeenCalledWith('2024-03-20');
  });

  // 🟠 Path 10: Confirm button click calls onProcess
  it('Path 10: Confirm button click calls onProcess', () => {
    render(<TransactionForm {...mockProps} />);
    
    const confirmBtn = screen.getByText('Confirm income');
    fireEvent.click(confirmBtn);
    
    expect(mockProps.onProcess).toHaveBeenCalled();
  });

  // 🟠 Path 11: Cancel button click calls onCancel (edit mode)
  it('Path 11: Cancel button click calls onCancel in edit mode', () => {
    render(<TransactionForm {...mockProps} editingId="123" />);
    
    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  // 🔴 Path 12: Edge case - zero amount renders as '0'
  it('Path 12: Zero amount renders as 0', () => {
    render(<TransactionForm {...mockProps} amount={0} />);
    
    const amountInput = screen.getByPlaceholderText('Amount (৳)');
    expect(amountInput).toHaveValue(0);
  });
});