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

import { filterStrategies } from '../utils/filterStrategies';
import { NotificationFacade } from '../components/NotificationFacade';

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
  
  // NEW FILTER STATES (STRATEGY PATTERN)
  const [filterType, setFilterType] = useState<'all' | 'date' | 'month' | 'year'>('all');
  const [specificDate, setSpecificDate] = useState<string>(''); 
  const [specificMonth, setSpecificMonth] = useState<string>(''); 
  const [specificYear, setSpecificYear] = useState<string>(new Date().getFullYear().toString());

  // Transaction Input States
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
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

// 3. Filter Records using the IMPORTED STRATEGY PATTERN
const filteredRecords = useMemo(() => {
  return records.filter(r => {
    const recDate = r.date?.toDate();
    if (!recDate) return true;
    
    // We use the imported filterStrategies from your utils folder
    const strategy = filterStrategies[filterType as keyof typeof filterStrategies] || filterStrategies.all;
    
    // Pass the correct value based on the type
    let val = '';
    if (filterType === 'date') val = specificDate;
    if (filterType === 'month') val = specificMonth;
    if (filterType === 'year') val = specificYear;

    return strategy(recDate, val);
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

  // 5. Action Handlers (USING FACADE)
  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await updateProfile(auth.currentUser!, { displayName: profileData.fullName });
      await setDoc(doc(db, 'users', user.uid, 'profile', 'info'), profileData);
      NotificationFacade.success("Profile updated successfully!");
    } catch (err) {
      NotificationFacade.error("Error updating profile.");
    }
  };

  const handleProcessRecord = async () => {
    if (amount <= 0 || !user) return;
    const colName = type === 'income' ? 'income' : 'expenses';
    const data = { amount, category: category || 'Uncategorized', description, date: Timestamp.now() };

    if (editingId) {
      await updateDoc(doc(db, 'users', user.uid, colName, editingId), data);
      setEditingId(null);
      NotificationFacade.success("Transaction updated!");
    } else {
      await addDoc(collection(db, 'users', user.uid, colName), data);
      NotificationFacade.success("Transaction added successfully!");
    }
    setAmount(0); setCategory(''); setDescription('');
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
    NotificationFacade.success("CSV Downloaded!");
  };

  const handleAddBudget = async () => {
    if (!budgetCategory || budgetLimit <= 0 || !user) return;
    await addDoc(collection(db, 'users', user.uid, 'budgets'), { category: budgetCategory, limit: budgetLimit });
    setBudgetCategory(''); setBudgetLimit(0);
    NotificationFacade.success("Budget rule added!");
  };

  const handleAddOrUpdateGoal = async () => {
    if (!goalName || goalTarget <= 0 || !user) return;
    
    if (editingGoalId) {
      await updateDoc(doc(db, 'users', user.uid, 'goals', editingGoalId), { name: goalName, target: goalTarget });
      setEditingGoalId(null);
      NotificationFacade.success("Goal updated!");
    } else {
      await addDoc(collection(db, 'users', user.uid, 'goals'), { name: goalName, target: goalTarget, current: 0 });
      NotificationFacade.success("New goal created!");
    }
    setGoalName(''); setGoalTarget(0);
  };

  // --- BEAUTIFUL DELETE GOAL CONFIRMATION (FACADE PATTERN) ---
  const handleDeleteGoal = async (id: string) => {
    if (!user) return;
    NotificationFacade.confirmDelete("Are you sure you want to delete this goal?", async () => {
      await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
      NotificationFacade.success("Goal removed.");
    });
  };

  const handleDepositGoal = async (id: string, currentAmount: number) => {
    if (!user) return;
    const depositAmt = depositAmounts[id] || 0;
    if (depositAmt <= 0) return;

    await updateDoc(doc(db, 'users', user.uid, 'goals', id), { current: (currentAmount || 0) + depositAmt });
    setDepositAmounts(prev => ({ ...prev, [id]: 0 }));
    NotificationFacade.success(`Deposited ৳${depositAmt} to your goal!`);
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
                  <select value={filterType} onChange={(e: any) => setFilterType(e.target.value)} style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', cursor: 'pointer' }}>
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
                    <select value={specificYear} onChange={(e) => setSpecificYear(e.target.value)}
                            style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none' }}>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  )}
                </div>
              </div>

              {/* SUMMARY CARDS */}
              <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                <SummaryCard title="Income" amount={stats.income} type="income" subtitle={getFilterSubtitle()} />
                <SummaryCard title="Expenses" amount={stats.expense} type="expense" subtitle={getFilterSubtitle()} />
                <SummaryCard title="Balance" amount={stats.balance} type={stats.balance >= 0 ? 'income' : 'expense'} subtitle={getFilterSubtitle()} />
              </div>

              {/* BUDGET ALERTS */}
              {budgetAlerts.length > 0 && (
                <div className="budget-alerts glass-panel text-red" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={20} /> <h3 style={{ margin: 0 }}>Budget Alerts</h3>
                  </div>
                  {budgetAlerts.map((a, i) => (
                    <p key={i} style={{ margin: 0 }}>You have exceeded your <strong>{a.category}</strong> budget by ৳{a.over.toLocaleString('en-IN')}</p>
                  ))}
                </div>
              )}

              {/* CHARTS SECTION */}
              <div className="charts-section glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3>Expense Breakdown</h3>
                  <div className="type-toggle" style={{ width: 'auto' }}>
                    <button className={chartType === 'pie' ? 'active' : ''} onClick={() => setChartType('pie')}>Pie</button>
                    <button className={chartType === 'bar' ? 'active' : ''} onClick={() => setChartType('bar')}>Bar</button>
                    <button className={chartType === 'line' ? 'active' : ''} onClick={() => setChartType('line')}>Line</button>
                  </div>
                </div>
                <div className="chart-container" style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                  {stats.chartData.labels.length > 0 ? (
                    chartType === 'pie' ? <Pie data={stats.chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#fff' } } } }} /> :
                    chartType === 'bar' ? <Bar data={stats.chartData} options={axisChartOptions} /> :
                    <Line data={stats.chartData} options={axisChartOptions} />
                  ) : <p style={{ color: '#94a3b8', alignSelf: 'center' }}>No expenses to chart for this period.</p>}
                </div>
              </div>
            </div>

            {/* QUICK ADD RIGHT PANEL */}
            <div className="right-panel">
              <TransactionForm 
                type={type} setType={setType} amount={amount} setAmount={setAmount}
                category={category} setCategory={setCategory} description={description} setDescription={setDescription}
                onProcess={handleProcessRecord} editingId={editingId}
                onCancel={() => { setEditingId(null); setAmount(0); setCategory(''); setDescription(''); }}
              />
            </div>
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div className="tab-section">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
              <TransactionList 
                records={records} 
                onExport={exportToCSV}
                onEdit={(r) => {
                  setEditingId(r.id); setAmount(r.amount); setCategory(r.category); setDescription(r.description); setType(r.type);
                  setActiveTab('dashboard');
                }}
                onDelete={async (id, recordType) => {
                  const col = recordType === 'income' ? 'income' : 'expenses';
                  await deleteDoc(doc(db, 'users', user.uid, col, id));
                }}
              />
              <CSVImport userId={user.uid} onComplete={() => NotificationFacade.success("Dashboard updated with new data!")} />
            </div>
          </div>
        )}

        {/* BUDGETS TAB */}
        {activeTab === 'budgets' && (
          <div className="tab-section">
            <div className="glass-panel" style={{ marginBottom: '20px' }}>
              <h3>Set Monthly Budget</h3>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <input type="text" placeholder="Category (e.g., Food)" value={budgetCategory} onChange={e => setBudgetCategory(e.target.value)} />
                <input type="number" placeholder="Limit (৳)" value={budgetLimit || ''} onChange={e => setBudgetLimit(Number(e.target.value))} />
                <button className="confirm-btn" style={{ width: 'auto' }} onClick={handleAddBudget}>Add Budget</button>
              </div>
            </div>
            
            <div className="budgets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {budgets.map(b => {
                const spent = monthlyCategoryTotals[b.category] || 0;
                const progress = Math.min((spent / b.limit) * 100, 100);
                const isOver = spent > b.limit;

                return (
                  <div key={b.id} className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{b.category}</strong>
                      
                      {/* FACADE PATTERN APPLIED TO BUDGET DELETION */}
                      <button className="icon-btn text-red" onClick={() => {
                        NotificationFacade.confirmDelete("Are you sure you want to delete this budget rule?", async () => {
                          await deleteDoc(doc(db, 'users', user.uid, 'budgets', b.id));
                          NotificationFacade.success("Budget removed.");
                        });
                      }}><Trash2 size={16} /></button>
                      
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '8px' }}>
                      <span>Spent: ৳{spent.toLocaleString('en-IN')}</span>
                      <span>Limit: ৳{b.limit.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: isOver ? '#ef4444' : '#2ecc71', transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                );
              })}
              {budgets.length === 0 && <p style={{ color: '#94a3b8' }}>No budgets set. Create one above to track spending!</p>}
            </div>
          </div>
        )}

        {/* GOALS TAB */}
        {activeTab === 'goals' && (
          <div className="tab-section">
             <div className="glass-panel" style={{ marginBottom: '20px' }}>
              <h3>{editingGoalId ? 'Edit Financial Goal' : 'Create Financial Goal'}</h3>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <input type="text" placeholder="Goal Name (e.g., New Car)" value={goalName} onChange={e => setGoalName(e.target.value)} />
                <input type="number" placeholder="Target Amount (৳)" value={goalTarget || ''} onChange={e => setGoalTarget(Number(e.target.value))} />
                <button className="confirm-btn" style={{ width: 'auto' }} onClick={handleAddOrUpdateGoal}>
                  {editingGoalId ? 'Update Goal' : 'Create Goal'}
                </button>
                {editingGoalId && <button className="cancel-btn" style={{ width: 'auto' }} onClick={() => { setEditingGoalId(null); setGoalName(''); setGoalTarget(0); }}>Cancel</button>}
              </div>
            </div>

            <div className="goals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {goals.map(g => {
                const progress = Math.min(((g.current || 0) / g.target) * 100, 100);
                return (
                  <div key={g.id} className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#2EC4FF' }}>{g.name}</h4>
                        <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>৳{(g.current || 0).toLocaleString('en-IN')} / ৳{g.target.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="icon-btn" onClick={() => triggerEditGoal(g)}><Edit2 size={16}/></button>
                        <button className="icon-btn text-red" onClick={() => handleDeleteGoal(g.id)}><Trash2 size={16}/></button>
                      </div>
                    </div>
                    
                    <div style={{ width: '100%', height: '10px', background: '#334155', borderRadius: '5px', overflow: 'hidden', marginBottom: '15px' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #2EC4FF, #00d2d3)', transition: 'width 0.3s' }}></div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="number" placeholder="Amount" value={depositAmounts[g.id] || ''} onChange={e => setDepositAmounts({ ...depositAmounts, [g.id]: Number(e.target.value) })} style={{ padding: '8px' }} />
                      <button className="confirm-btn" style={{ width: 'auto', padding: '8px 15px' }} onClick={() => handleDepositGoal(g.id, g.current)}><Plus size={16}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SAVINGS TAB */}
        {activeTab === 'savings' && (
          <div className="tab-section">
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
              <h2>Monthly Savings</h2>
              <p style={{ color: '#94a3b8' }}>For the current month</p>
              <h1 style={{ fontSize: '3rem', margin: '20px 0', color: monthlySavings >= 0 ? '#2ecc71' : '#ef4444' }}>
                {monthlySavings >= 0 ? '+' : '-'}৳{Math.abs(monthlySavings).toLocaleString('en-IN')}
              </h1>
              {monthlySavings > 0 ? (
                <p style={{ color: '#2ecc71' }}>Great job! Consider allocating this to your financial goals.</p>
              ) : (
                <p style={{ color: '#ef4444' }}>You are spending more than you are earning this month. Review your budgets!</p>
              )}
            </div>
          </div>
        )}

{/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="tab-section" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* 1. PROFILE SETTINGS  */}
            <div className="glass-panel">
              <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><User size={24}/> Profile Settings</h2>
              
              <div className="form-group">
                <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Username</label>
                <div className="input-with-icon" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0 10px', marginBottom: '15px' }}>
                  <User size={18} style={{ color: '#94a3b8' }} />
                  <input type="text" value={profileData.username || ''} onChange={e => setProfileData({...profileData, username: e.target.value})} placeholder="Enter your username" style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', padding: '12px', color: '#fff' }} />
                </div>

                <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Full Name</label>
                <div className="input-with-icon" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0 10px', marginBottom: '15px' }}>
                  <User size={18} style={{ color: '#94a3b8' }} />
                  <input type="text" value={profileData.fullName || ''} onChange={e => setProfileData({...profileData, fullName: e.target.value})} placeholder="Enter your full name" style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', padding: '12px', color: '#fff' }} />
                </div>

                <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Email Address</label>
                <div className="input-with-icon" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0 10px', marginBottom: '15px', opacity: 0.7 }}>
                  <Mail size={18} style={{ color: '#94a3b8' }} />
                  <input type="email" value={profileData.email || ''} disabled style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', padding: '12px', cursor: 'not-allowed', color: '#fff' }} />
                </div>

                <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Date of Birth</label>
                <div className="input-with-icon" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0 10px', marginBottom: '20px' }}>
                  <Calendar size={18} style={{ color: '#94a3b8' }} />
                  <input type="date" value={profileData.birthdate || ''} onChange={e => setProfileData({...profileData, birthdate: e.target.value})} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', padding: '12px', color: 'white' }} />
                </div>

                <button className="confirm-btn" onClick={handleUpdateProfile} style={{ marginTop: '5px' }}>Save Changes</button>
              </div>
            </div>

            {/* 2. ADDED: DATA MANAGEMENT */}
            <div className="glass-panel">
              <h2 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><Receipt size={24}/> Data Management</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px' }}>Download a complete copy of all your financial records stored on CashTrail.</p>
              <button 
                className="confirm-btn" 
                onClick={exportToCSV} 
                style={{ background: 'transparent', border: '1px solid #2EC4FF', color: '#2EC4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                Export All Data to CSV
              </button>
            </div>

            {/* 3. ADDED: DANGER ZONE (Using your new Facade!) */}
            <div className="glass-panel" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <h2 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}><AlertCircle size={24}/> Danger Zone</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px' }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
              <button 
                className="confirm-btn" 
                style={{ background: '#ef4444', color: 'white', border: 'none' }}
                onClick={() => {
                  NotificationFacade.confirmDelete("Are you absolutely sure you want to delete your account? All data will be lost.", async () => {
                    // Note: Actual user deletion requires re-authentication in Firebase.
                    // This is just the UI/UX setup for it.
                    NotificationFacade.error("Account deletion requires recent sign-in. Please log out and log back in to perform this action.");
                  })
                }}
              >
                Delete Account
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;