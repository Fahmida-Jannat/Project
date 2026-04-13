import React from 'react';

interface Props {
  type: 'income' | 'expense';
  setType: (type: 'income' | 'expense') => void;
  amount: number;
  setAmount: (amt: number) => void;
  category: string;
  setCategory: (cat: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  date: string;
  setDate: (d: string) => void;
  onProcess: () => void;
  editingId: string | null;
  onCancel: () => void;
}

const TransactionForm: React.FC<Props> = (props) => {
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
          value={props.amount} 
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

        {/* Date Input with Calendar Icon */}
        <div style={{ position: 'relative', marginBottom: '15px' }}>
          <span style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            fontSize: '16px',
            lineHeight: 1
          }}>📅</span>
          <input
            type="date"
            value={props.date}
            onChange={e => props.setDate(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '14px 14px 14px 42px',
              borderRadius: '10px',
              color: props.date ? 'white' : '#8fa7b7',
              boxSizing: 'border-box',
              colorScheme: 'dark',
              fontFamily: 'inherit',
              fontSize: '14px',
              outline: 'none',
            } as React.CSSProperties}
          />
        </div>
        
        <button className="confirm-btn" onClick={props.onProcess}>
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