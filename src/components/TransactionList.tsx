import React, { useState } from 'react';
import { Download, Edit2, Trash2, Calendar, Search } from 'lucide-react';

// Importing the Facade Pattern
import { NotificationFacade } from '../components/NotificationFacade';

interface Props {
  records: any[];
  onExport: () => void;
  onEdit: (record: any) => void;
  onDelete: (id: string, type: string) => void;
}

const TransactionList: React.FC<Props> = ({ records, onExport, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Filter records based on search term
  const filteredSearch = records.filter(r => 
    r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Group the FILTERED records by Date
  const groupedRecords = filteredSearch.reduce((groups: any, record) => {
    const date = record.date?.toDate().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    }) || 'Unknown Date';
    
    if (!groups[date]) groups[date] = [];
    groups[date].push(record);
    return groups;
  }, {});

  // 3. Facade Implementation: Handling Export with a Notification
  const handleExportWithNotification = () => {
    try {
      onExport();
      // Using the Facade to show success
      NotificationFacade.success('Transaction history exported successfully!');
    } catch (error) {
      // Using the Facade to show error
      NotificationFacade.error('Export failed. Please try again.');
    }
  };

  return (
    <div className="glass-panel history-container">
      <div className="history-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2>Transaction History</h2>
        <div style={{display: 'flex', gap: '10px'}}>
            
            {/* Search Bar */}
            <div className="search-input-wrapper">
                <Search size={16} />
                <input 
                    type="text" 
                    placeholder="Search transactions..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Export Button using the new handler */}
            <button 
              className="confirm-btn" 
              style={{width: 'auto', padding: '10px 20px'}} 
              onClick={handleExportWithNotification}
            >
                <Download size={18}/> Export
            </button>
        </div>
      </div>

      {Object.keys(groupedRecords).length === 0 ? (
        <p style={{textAlign: 'center', color: '#8fa7b7', marginTop: '40px'}}>No transactions found.</p>
      ) : (
        Object.keys(groupedRecords).map((date) => (
          <div key={date} className="date-group">
            <div className="date-divider">
              <Calendar size={14} />
              <span>{date}</span>
            </div>
            
            <table className="history-table">
              <tbody>
                {groupedRecords[date].map((r: any) => (
                  <tr key={r.id}>
                    <td style={{width: '40%'}}>{r.description || 'No description'}</td>
                    <td><span className="cat-pill">{r.category}</span></td>
                    <td><span className={`type-tag ${r.type}`}>{r.type.toUpperCase()}</span></td>
                    
                    <td className={r.type === 'income' ? 'text-green' : 'text-red'} style={{fontWeight: 'bold'}}>
                      {r.type === 'income' ? '+' : '-'}৳ {r.amount.toLocaleString('en-IN')}
                    </td>
                    
                    <td className="actions-cell">
                      <button className="icon-btn" onClick={() => onEdit(r)}><Edit2 size={16}/></button>
                      <button className="icon-btn text-red" onClick={() => onDelete(r.id, r.type)}><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default TransactionList;