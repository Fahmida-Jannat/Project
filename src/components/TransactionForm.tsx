import React from 'react';
import { NotificationFacade } from '../facades/NotificationFacade';

interface Props {
  type: 'income' | 'expense';
  setType: (type: 'income' | 'expense') => void;
  amount: number;
  setAmount: (amt: number) => void;
  category: string;
  setCategory: (cat: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  onProcess: () => void;
  editingId: string | null;
  onCancel: () => void;
}

const TransactionForm: React.FC<Props> = (props) => {
  
  // 1. Logic to handle submission and use the Facade
  const handleSubmit = () => {
    if (!props.amount || props.amount <= 0) {
      NotificationFacade.error("Please enter a valid amount");
      return;
    }
    if (!props.category.trim()) {
      NotificationFacade.error("Category is required");
      return;
    }

    // If all good, proceed
    props.onProcess();
    
    //  Show success if adding a new record
    if (!props.editingId) {
      NotificationFacade.success(`${props.type} added successfully!`);
    }
  };

  return (
    <div className="glass-panel quick-add-card">
      <h3>{props.editingId ? 'Edit Record' : 'Quick Add'}</h3>
      
      <div className="type-toggle">
        <button 
          className={props.type === 'income' ? 'active' : ''} 
          onClick={() => props.setType('income')}
        >Income</button>
        <button 
          className={props.type === 'expense' ? 'active' : ''} 
          onClick={() => props.setType('expense')}
        >Expense</button>
      </div>

      <div className="form-group">
        <input 
          type="number" 
          placeholder="Amount (৳)" 
          value={props.amount || ''} 
          onChange={e => props.setAmount(Number(e.target.value))} 
        />
        <input 
          type="text" 
          placeholder="Category (e.g., Food, Salary)" 
          value={props.category} 
          onChange={e => props.setCategory(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Description" 
          value={props.description} 
          onChange={e => props.setDescription(e.target.value)} 
        />
        
        {/* Changed props.onProcess to handleSubmit */}
        <button className="confirm-btn" onClick={handleSubmit}>
          {props.editingId ? 'Update' : 'Confirm'} {props.type}
        </button>
        
        {props.editingId && (
          <button className="cancel-btn" onClick={props.onCancel}>Cancel</button>
        )}
      </div>
    </div>
  );
};

export default TransactionForm;