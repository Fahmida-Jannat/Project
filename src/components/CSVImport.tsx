import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface CSVImportProps {
  userId: string;
  onComplete: () => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ userId, onComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleImport = async () => {
    if (!file || !userId) {
      setMessage({ type: 'error', text: 'Please select a CSV file first.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        // Split by lines and filter out any empty rows
        const rows = text.split('\n').filter(row => row.trim() !== '');
        
        // Assuming the first row is the header: Date, Type, Category, Description, Amount
        // We start looping from index 1 to skip the header
        let importCount = 0;

        for (let i = 1; i < rows.length; i++) {
          // A simple split by comma (Note: this basic split assumes no commas inside the CSV text fields)
          // If you used the export function from your dashboard, it wraps text in quotes, so we strip them here.
          const columns = rows[i].split(',').map(col => col.replace(/(^"|"$)/g, '').trim());
          
          if (columns.length >= 5) {
            const dateStr = columns[0];
            const type = columns[1].toLowerCase(); // 'income' or 'expense'
            const category = columns[2];
            const description = columns[3];
            const amount = parseFloat(columns[4]);

            if (!isNaN(amount) && (type === 'income' || type === 'expense')) {
              const collectionName = type === 'income' ? 'income' : 'expenses';
              
              // Convert the date string back to a Date object, fallback to now if invalid
              const parsedDate = new Date(dateStr);
              const dateObj = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

              await addDoc(collection(db, 'users', userId, collectionName), {
                amount,
                category: category || 'Uncategorized',
                description: description || '',
                date: Timestamp.fromDate(dateObj)
              });
              importCount++;
            }
          }
        }

        setMessage({ type: 'success', text: `Successfully imported ${importCount} transactions!` });
        setFile(null);
        // Reset file input visually
        const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Tell the Dashboard to refresh or change state if needed
        setTimeout(() => {
          onComplete();
          setMessage(null);
        }, 2000);

      } catch (error) {
        console.error("Error importing CSV: ", error);
        setMessage({ type: 'error', text: 'Failed to process the CSV file. Please check the format.' });
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Failed to read the file.' });
      setLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Upload size={20} className="text-blue" />
        <h3 style={{ margin: 0 }}>Import Transactions (CSV)</h3>
      </div>
      
      <p style={{ fontSize: '0.85rem', color: '#8fa7b7', margin: 0 }}>
        Upload a CSV file to bulk add transactions. Format required: <strong>Date, Type, Category, Description, Amount</strong>.
      </p>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input 
          id="csv-upload"
          type="file" 
          accept=".csv" 
          onChange={handleFileChange}
          style={{
            padding: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff'
          }}
        />
        <button 
          className="confirm-btn" 
          onClick={handleImport} 
          disabled={loading || !file}
          style={{ width: 'auto', padding: '10px 20px', opacity: (loading || !file) ? 0.5 : 1 }}
        >
          {loading ? 'Importing...' : 'Start Import'}
        </button>
      </div>

      {message && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: message.type === 'error' ? '#e74c3c' : '#2ecc71',
          fontSize: '0.9rem',
          marginTop: '5px'
        }}>
          {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default CSVImport;