import { useEffect, useState, useMemo } from 'react';
import { signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import {
  collection, onSnapshot, addDoc, deleteDoc, updateDoc,
  doc, Timestamp, query, orderBy, setDoc, getDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { 
  LayoutDashboard, Receipt, Target, Wallet, Settings, 
  LogOut, Plus, Filter, AlertCircle, PieChart, Edit2, Trash2, User, Mail, Calendar
} from 'lucide-react';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, 
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title
} from 'chart.js';
import toast from 'react-hot-toast'; 

import SummaryCard from '../components/SummaryCard';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import CSVImport from '../components/CSVImport';

import '../styles/Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'goals' | 'savings' | 'budgets' | 'settings'>('dashboard');
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  
  // NEW FILTER STATES
  const [filterType, setFilterType] = useState<'all' | 'date' | 'month' | 'year'>('all');
  const [specificDate, setSpecificDate] = useState<string>(''); 
  const [specificMonth, setSpecificMonth] = useState<string>(''); 
  const [specificYear, setSpecificYear] = useState<string>(new Date().getFullYear().toString());

  // Transaction Input States
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState<string>(''); // NEW DATE STATE
  const [editingId, setEditingId] = useState<string | null>(null);

  // Goal States
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState<number>(0);
  const [depositAmounts, setDepositAmounts] = useState<{ [key: string]: number }>({});
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Budget States
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState<number>(0);

  // Profile Settings States
  const [profileData, setProfileData] = useState({ username: '', fullName: '', email: '', birthdate: '' });

  // 1. Auth & Profile Loader
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (u) => {
      if (!u) navigate('/login');
      else {
        setUser(u);
        const docRef = doc(db, 'users', u.uid, 'profile', 'info');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data() as any);
        } else {
          setProfileData(prev => ({ ...prev, email: u.email || '', fullName: u.displayName || '' }));
        }
      }
    });
    return () => unsubAuth();
  }, [navigate]);

  // 2. Real-time Data Listeners
  useEffect(() => {
    if (!user) return;
    const qInc = query(collection(db, 'users', user.uid, 'income'), orderBy('date', 'desc'));
    const qExp = query(collection(db, 'users', user.uid, 'expenses'), orderBy('date', 'desc'));
    const qGoals = query(collection(db, 'users', user.uid, 'goals'));
    const qBudgets = query(collection(db, 'users', user.uid, 'budgets'));

    const unsubInc = onSnapshot(qInc, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, type: 'income', ...d.data() }));
      setRecords(prev => [...data, ...prev.filter(r => r.type === 'expense')].sort((a,b) => b.date.toMillis() - a.date.toMillis()));
    });

    const unsubExp = onSnapshot(qExp, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, type: 'expense', ...d.data() }));
      setRecords(prev => [...prev.filter(r => r.type === 'income'), ...data].sort((a,b) => b.date.toMillis() - a.date.toMillis()));
    });

    const unsubGoals = onSnapshot(qGoals, (snap) => setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubBudgets = onSnapshot(qBudgets, (snap) => setBudgets(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubInc(); unsubExp(); unsubGoals(); unsubBudgets(); };
  }, [user]);

  // 3. Filter Records by Specific Date, Month, or Year
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filterType === 'all') return true;
      
      const recDate = r.date?.toDate();
      if (!recDate) return true;

      if (filterType === 'date') {
        if (!specificDate) return true;
        const recDateString = recDate.toISOString().split('T')[0];
        return recDateString === specificDate;
      }

      if (filterType === 'month') {
        if (!specificMonth) return true;
        const recMonthString = `${recDate.getFullYear()}-${String(recDate.getMonth() + 1).padStart(2, '0')}`;
        return recMonthString === specificMonth;
      }

      if (filterType === 'year') {
        if (!specificYear) return true;
        return recDate.getFullYear().toString() === specificYear;
      }

      return true;
    });
  }, [records, filterType, specificDate, specificMonth, specificYear]);

  // 4. Stats & Budgets Calculations
  const { stats, budgetAlerts, monthlyCategoryTotals, monthlySavings } = useMemo(() => {
    const income = filteredRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
    const expense = filteredRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
    
    const totalInc = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
    const totalExp = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
    const balance = totalInc - totalExp;

    const catTotals: any = {};
    filteredRecords.filter(r => r.type === 'expense').forEach(r => {
      catTotals[r.category] = (catTotals[r.category] || 0) + r.amount;
    });
    const maxVal = Math.max(...(Object.values(catTotals) as number[]), 0);

    const chartData = {
      labels: Object.keys(catTotals),
      datasets: [{
        label: 'Taka (৳)',
        data: Object.values(catTotals),
        backgroundColor: ['#2EC4FF', '#1B5F8A', '#00d2d3', '#ff9f43', '#5f27cd', '#ee5253'],
        borderColor: '#0b1e2d',
        borderWidth: 2, tension: 0.3, fill: true
      }]
    };

    const now = new Date();
    const currentMonthIncome = records.filter(r => r.type === 'income' && r.date?.toDate().getMonth() === now.getMonth() && r.date?.toDate().getFullYear() === now.getFullYear()).reduce((s, r) => s + r.amount, 0);
    const currentMonthExpensesList = records.filter(r => r.type === 'expense' && r.date?.toDate().getMonth() === now.getMonth() && r.date?.toDate().getFullYear() === now.getFullYear());
    const currentMonthExpense = currentMonthExpensesList.reduce((s, r) => s + r.amount, 0);
    const mSavings = currentMonthIncome - currentMonthExpense;

    const monthCatTotals: any = {};
    currentMonthExpensesList.forEach(r => {
      monthCatTotals[r.category] = (monthCatTotals[r.category] || 0) + r.amount;
    });

    const alerts: any[] = [];
    budgets.forEach(b => {
      const spent = monthCatTotals[b.category] || 0;
      if (spent > b.limit) alerts.push({ category: b.category, over: spent - b.limit });
    });

    return { 
      stats: { income, expense, balance, chartData, maxVal }, 
      budgetAlerts: alerts,
      monthlyCategoryTotals: monthCatTotals,
      monthlySavings: mSavings
    };
  }, [filteredRecords, records, budgets]);

  const axisChartOptions = {
    maintainAspectRatio: false, layout: { padding: { top: 20 } },
    scales: {
      y: { beginAtZero: true, suggestedMax: stats.maxVal + (stats.maxVal * 0.2), grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { display: false } }
    },
    plugins: { legend: { display: false } }
  };

  const getFilterSubtitle = () => {
    if (filterType === 'all') return 'All Time';
    if (filterType === 'date' && specificDate) return specificDate;
    if (filterType === 'month' && specificMonth) return specificMonth;
    if (filterType === 'year' && specificYear) return specificYear;
    return 'All Time';
  };

  // 5. Action Handlers
  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await updateProfile(auth.currentUser!, { displayName: profileData.fullName });
      await setDoc(doc(db, 'users', user.uid, 'profile', 'info'), profileData);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Error updating profile.");
    }
  };

  const handleProcessRecord = async () => {
    if (amount <= 0 || !user) return;
    const colName = type === 'income' ? 'income' : 'expenses';
    const data = { 
      amount, 
      category: category || 'Uncategorized', 
      description, 
      date: date ? Timestamp.fromDate(new Date(date)) : Timestamp.now() // UPDATED
    };

    if (editingId) {
      await updateDoc(doc(db, 'users', user.uid, colName, editingId), data);
      setEditingId(null);
      toast.success("Transaction updated!");
    } else {
      await addDoc(collection(db, 'users', user.uid, colName), data);
      toast.success("Transaction added successfully!");
    }
    setAmount(0); setCategory(''); setDescription(''); setDate(''); // RESET DATE
  };

  const exportToCSV = () => {
    const headers = "Date,Type,Category,Description,Amount\n";
    const rows = filteredRecords.map(r => {
      const dateStr = r.date?.toDate().toLocaleDateString() || '';
      return `"${dateStr}","${r.type.toUpperCase()}","${r.category}","${r.description || ''}",${r.amount}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `CashTrail_Export_${new Date().toLocaleDateString()}.csv`;
    link.click();
    toast.success("CSV Downloaded!");
  };

  const handleAddBudget = async () => {
    if (!budgetCategory || budgetLimit <= 0 || !user) return;
    await addDoc(collection(db, 'users', user.uid, 'budgets'), { category: budgetCategory, limit: budgetLimit });
    setBudgetCategory(''); setBudgetLimit(0);
    toast.success("Budget rule added!");
  };

  const handleAddOrUpdateGoal = async () => {
    if (!goalName || goalTarget <= 0 || !user) return;
    
    if (editingGoalId) {
      await updateDoc(doc(db, 'users', user.uid, 'goals', editingGoalId), { name: goalName, target: goalTarget });
      setEditingGoalId(null);
      toast.success("Goal updated!");
    } else {
      await addDoc(collection(db, 'users', user.uid, 'goals'), { name: goalName, target: goalTarget, current: 0 });
      toast.success("New goal created!");
    }
    setGoalName(''); setGoalTarget(0);
  };

  // --- BEAUTIFUL DELETE GOAL CONFIRMATION ---
  const handleDeleteGoal = async (id: string) => {
    if (!user) return;
    
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
        <p style={{ margin: 0, fontWeight: '500', color: '#fff' }}>Are you sure you want to delete this goal?</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
              toast.success("Goal removed.");
            }}
            style={{ padding: '8px 16px', background: '#ef4444', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          >Yes, Delete</button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            style={{ padding: '8px 16px', background: '#374151', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          >Cancel</button>
        </div>
      </div>
    ), { duration: Infinity, style: { background: '#1e293b', border: '1px solid #334155' } });
  };

  const handleDepositGoal = async (id: string, currentAmount: number) => {
    if (!user) return;
    const depositAmt = depositAmounts[id] || 0;
    if (depositAmt <= 0) return;

    await updateDoc(doc(db, 'users', user.uid, 'goals', id), { current: (currentAmount || 0) + depositAmt });
    setDepositAmounts(prev => ({ ...prev, [id]: 0 }));
    toast.success(`Deposited ৳${depositAmt} to your goal!`);
  };

  const triggerEditGoal = (g: any) => {
    setEditingGoalId(g.id); setGoalName(g.name); setGoalTarget(g.target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-brand"><h2>CASHTRAIL</h2></div>
        <nav className="nav-menu">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={20}/> Dashboard</button>
          <button className={activeTab === 'expenses' ? 'active' : ''} onClick={() => setActiveTab('expenses')}><Receipt size={20}/> Expenses</button>
          <button className={activeTab === 'budgets' ? 'active' : ''} onClick={() => setActiveTab('budgets')}><PieChart size={20}/> Budgets</button>
          <button className={activeTab === 'goals' ? 'active' : ''} onClick={() => setActiveTab('goals')}><Target size={20}/> Goals</button>
          <button className={activeTab === 'savings' ? 'active' : ''} onClick={() => setActiveTab('savings')}><Wallet size={20}/> Savings</button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}><Settings size={20}/> Settings</button>
        </nav>
        <button className="logout-btn" onClick={() => signOut(auth)}><LogOut size={20}/> Log Out</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        
        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <div className="left-panel">
              <div className="welcome-section" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <h2>Welcome to CashTrail, <span>{profileData.fullName || user?.email?.split('@')[0]}</span></h2>
                  <p>Track your spending and save more effectively.</p>
                </div>
                
                {/* DYNAMIC FILTER SECTION */}
                <div className="filter-dropdown" style={{ display: 'flex', gap: '10px' }}>
                  <Filter size={18} />
                  <select value={filterType} onChange={(e: any) => setFilterType(e.target.value)}>
                    <option value="all">All Time</option>
                    <option value="date">Exact Date</option>
                    <option value="month">By Month</option>
                    <option value="year">By Year</option>
                  </select>
                  
                  {filterType === 'date' && (
                    <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} 
                           style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none' }} />
                  )}
                  {filterType === 'month' && (
                    <input type="month" value={specificMonth} onChange={(e) => setSpecificMonth(e.target.value)} 
                           style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none' }} />
                  )}
                  {filterType === 'year' && (
                    <input type="number" placeholder="YYYY" value={specificYear} onChange={(e) => setSpecificYear(e.target.value)} 
                           style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', width: '60px' }} />
                  )}
                </div>
              </div>

              <div className="summary-cards">
                <SummaryCard title="Income" amount={stats.income} type="income" subtitle={getFilterSubtitle()} />
                <SummaryCard title="Expenses" amount={stats.expense} type="expense" subtitle={getFilterSubtitle()} />
                <SummaryCard title="Total Balance" amount={stats.balance} type="balance" />
              </div>

              <section className="glass-panel analysis-section">
                <div className="section-header">
                  <h3>Spending Analysis (৳)</h3>
                  <div className="chart-toggles">
                    <button className={chartType === 'pie' ? 'active' : ''} onClick={() => setChartType('pie')}>Pie</button>
                    <button className={chartType === 'bar' ? 'active' : ''} onClick={() => setChartType('bar')}>Bar</button>
                    <button className={chartType === 'line' ? 'active' : ''} onClick={() => setChartType('line')}>Line</button>
                  </div>
                </div>
                <div className="chart-wrapper">
                  {chartType === 'pie' && <Pie data={stats.chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#fff' } } } }}/>}
                  {chartType === 'bar' && <Bar data={stats.chartData} options={axisChartOptions}/>}
                  {chartType === 'line' && <Line data={stats.chartData} options={axisChartOptions}/>}
                </div>
              </section>
            </div>

            <div className="right-panel">
              {budgetAlerts.length > 0 && (
                <div className="alerts-container">
                  {budgetAlerts.map((alert, i) => (
                    <div key={i} className="alert-box">
                      <AlertCircle size={20}/>
                      <div>
                        <strong>Budget Exceeded!</strong>
                        <p>You overspent on <b>{alert.category}</b> by ৳ {alert.over.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <TransactionForm 
                type={type} setType={setType} amount={amount} setAmount={setAmount}
                category={category} setCategory={setCategory} description={description} 
                setDescription={setDescription} date={date} setDate={setDate}
                onProcess={handleProcessRecord} editingId={editingId}
                onCancel={() => { setEditingId(null); setAmount(0); setCategory(''); setDescription(''); setDate(''); }}
              />
            </div>
          </div>
        )}

        {/* EXPENSES / TRANSACTIONS VIEW */}
        {activeTab === 'expenses' && (
          <>
            <TransactionList 
              records={filteredRecords} 
              onExport={exportToCSV}
              onEdit={(r: any) => { 
                setEditingId(r.id); 
                setAmount(r.amount); 
                setCategory(r.category); 
                setDescription(r.description); 
                setType(r.type); 
                setActiveTab('dashboard'); 
              }}
              // --- BEAUTIFUL DELETE TRANSACTION CONFIRMATION ---
              onDelete={(id: string, t: string) => { 
                toast((toastItem) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontWeight: '500', color: '#fff' }}>Delete this record?</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={async () => {
                          toast.dismiss(toastItem.id);
                          await deleteDoc(doc(db, 'users', user.uid, t === 'income' ? 'income' : 'expenses', id));
                          toast.success("Transaction deleted.");
                        }}
                        style={{ padding: '8px 16px', background: '#ef4444', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                      >Yes, Delete</button>
                      <button 
                        onClick={() => toast.dismiss(toastItem.id)}
                        style={{ padding: '8px 16px', background: '#374151', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                      >Cancel</button>
                    </div>
                  </div>
                ), { duration: Infinity, style: { background: '#1e293b', border: '1px solid #334155' } });
              }}
            />
            <div style={{marginTop: '20px'}}>
              <CSVImport userId={user?.uid} onComplete={() => setActiveTab('expenses')} />
            </div>
          </>
        )}

        {/* BUDGETS VIEW */}
        {activeTab === 'budgets' && (
          <div className="goals-view">
            <div className="glass-panel add-goal-box">
              <h3>Create Monthly Budget</h3>
              <div className="goal-inputs">
                <input type="text" placeholder="Category (e.g. Food, Rent)" value={budgetCategory} onChange={e => setBudgetCategory(e.target.value)} />
                <input type="number" placeholder="Monthly Limit (৳)" value={budgetLimit || ''} onChange={e => setBudgetLimit(Number(e.target.value))} />
                <button className="confirm-btn" onClick={handleAddBudget}><Plus size={18}/> Add Budget</button>
              </div>
            </div>
            <div className="goals-grid">
              {budgets.map(b => {
                const spent = monthlyCategoryTotals[b.category] || 0;
                const percent = Math.min((spent / b.limit) * 100, 100);
                const isOver = spent > b.limit;
                return (
                  <div key={b.id} className="goal-card glass-panel" style={{border: isOver ? '1px solid #e74c3c' : ''}}>
                    <div className="goal-header">
                      <h4>{b.category} Budget</h4>
                      {/* --- BEAUTIFUL DELETE BUDGET CONFIRMATION --- */}
                      <button className="icon-btn text-red" onClick={() => {
                        toast((t) => (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontWeight: '500', color: '#fff' }}>Delete this budget rule?</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button 
                                onClick={async () => {
                                  toast.dismiss(t.id);
                                  await deleteDoc(doc(db, 'users', user.uid, 'budgets', b.id));
                                  toast.success("Budget removed.");
                                }}
                                style={{ padding: '8px 16px', background: '#ef4444', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                              >Yes, Delete</button>
                              <button 
                                onClick={() => toast.dismiss(t.id)}
                                style={{ padding: '8px 16px', background: '#374151', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                              >Cancel</button>
                            </div>
                          </div>
                        ), { duration: Infinity, style: { background: '#1e293b', border: '1px solid #334155' } });
                      }}><Trash2 size={16}/></button>
                    </div>
                    <div className="goal-stats">
                      <span className="goal-current" style={{color: isOver ? '#e74c3c' : '#2EC4FF'}}>৳ {spent.toLocaleString('en-IN')}</span>
                      <span className="goal-target">of ৳ {b.limit.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-fill" style={{width: `${percent}%`, background: isOver ? '#e74c3c' : '#2EC4FF'}}></div>
                    </div>
                    {isOver && <p style={{color: '#e74c3c', fontSize: '12px', marginTop: '10px'}}>Over budget by ৳ {(spent - b.limit).toLocaleString('en-IN')}!</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GOALS VIEW */}
        {activeTab === 'goals' && (
          <div className="goals-view">
            <div className="glass-panel add-goal-box">
              <h3>{editingGoalId ? 'Edit Goal' : 'Create New Goal'}</h3>
              <div className="goal-inputs">
                <input type="text" placeholder="Goal Name (e.g., Vacation)" value={goalName} onChange={e => setGoalName(e.target.value)} />
                <input type="number" placeholder="Target Amount (৳)" value={goalTarget || ''} onChange={e => setGoalTarget(Number(e.target.value))} />
                <button className="confirm-btn" onClick={handleAddOrUpdateGoal}>
                  {editingGoalId ? <><Edit2 size={18}/> Update Goal</> : <><Plus size={18}/> Add Goal</>}
                </button>
                {editingGoalId && (
                  <button className="cancel-btn" onClick={() => { setEditingGoalId(null); setGoalName(''); setGoalTarget(0); }}>Cancel</button>
                )}
              </div>
            </div>
            
            <div className="goals-grid">
              {goals.map(g => {
                const percent = Math.min(((g.current || 0) / g.target) * 100, 100);
                return (
                  <div key={g.id} className="goal-card glass-panel">
                    <div className="goal-header">
                      <h4>{g.name}</h4>
                      <div className="goal-actions">
                        <button className="icon-btn" onClick={() => triggerEditGoal(g)}><Edit2 size={16}/></button>
                        <button className="icon-btn text-red" onClick={() => handleDeleteGoal(g.id)}><Trash2 size={16}/></button>
                      </div>
                    </div>
                    
                    <div className="goal-stats">
                      <span className="goal-current">৳ {(g.current || 0).toLocaleString('en-IN')}</span>
                      <span className="goal-target">of ৳ {g.target.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="progress-container">
                      <div className="progress-fill" style={{width: `${percent}%`}}></div>
                    </div>
                    
                    <div className="deposit-box">
                      <input 
                        type="number" 
                        placeholder="Add money (৳)..." 
                        value={depositAmounts[g.id] || ''} 
                        onChange={e => setDepositAmounts({...depositAmounts, [g.id]: Number(e.target.value)})}
                      />
                      <button onClick={() => handleDepositGoal(g.id, g.current)}>Deposit</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SAVINGS VIEW */}
        {activeTab === 'savings' && (
          <div className="savings-view glass-panel">
            <h2>Your Savings Overview</h2>
            <div className="savings-grid">
              <div className="save-box">
                <span>Monthly Savings (This Month)</span>
                <h1>৳ {monthlySavings.toLocaleString('en-IN')}</h1>
              </div>
              <div className="save-box">
                <span>Yearly Projected Savings</span>
                <h1>৳ {(monthlySavings * 12).toLocaleString('en-IN')}</h1>
              </div>
              <div className="save-box">
                <span>Total Accumulated Balance</span>
                <h1>৳ {stats.balance.toLocaleString('en-IN')}</h1>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {activeTab === 'settings' && (
          <div className="settings-container">
            <div className="glass-panel profile-card">
              <h2>Profile Settings</h2>
              <div className="profile-form">
                <div className="input-group">
                  <label><User size={16}/> Username</label>
                  <input type="text" value={profileData.username} onChange={e => setProfileData({...profileData, username: e.target.value})} />
                </div>
                <div className="input-group">
                  <label><User size={16}/> Full Name</label>
                  <input type="text" value={profileData.fullName} onChange={e => setProfileData({...profileData, fullName: e.target.value})} />
                </div>
                <div className="input-group">
                  <label><Mail size={16}/> Email</label>
                  <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} disabled style={{opacity: 0.6}} />
                </div>
                <div className="input-group">
                  <label><Calendar size={16}/> Birthdate</label>
                  <input type="date" value={profileData.birthdate} onChange={e => setProfileData({...profileData, birthdate: e.target.value})} />
                </div>
                <button className="confirm-btn" style={{marginTop: '15px'}} onClick={handleUpdateProfile}>Update Profile</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;