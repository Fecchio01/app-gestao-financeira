import { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import TransactionModal from './components/TransactionModal';
import Login from './components/Login';
import { DataLayer } from './lib/data';
import { supabase } from './lib/supabase';
import { 
  Hexagon, PenLine, Zap, Plus, Calculator, Briefcase, Coins, 
  ArrowDownRight, Landmark, ShieldCheck, ListOrdered, Inbox, 
  Repeat, X, PieChart, Settings, Rocket, Target, LogOut
} from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editBanca, setEditBanca] = useState('');
  const [editMeta, setEditMeta] = useState('');

  const [transactions, setTransactions] = useState([]);
  const [goal, setGoal] = useState(null);
  
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [monthlyInvested, setMonthlyInvested] = useState(0);
  const [allTimeInvested, setAllTimeInvested] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState({});

  const now = new Date();
  const currentMonthName = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    if (!session) return;
    setLoadingData(true);

    const userGoal = await DataLayer.getUserGoal();
    if (userGoal && userGoal.annualGoal !== undefined) {
      setNeedsOnboarding(false);
      setGoal(userGoal);
    } else {
      setNeedsOnboarding(true);
      setLoadingData(false);
      return;
    }
    
    const txs = await DataLayer.getTransactions();
    const currentMonthStr = now.toISOString().slice(0, 7); 
    
    let mIncome = 0;
    let mExpense = 0;
    let mInvested = 0;
    let totalInvested = 0;
    const expenseByCat = {};
    const displayTxs = [];

    txs.forEach(tx => {
      const isCurrentMonth = tx.date.startsWith(currentMonthStr);
      const isRecurrent = tx.recurrent === true;
      const isPastOrCurrentRecurrent = isRecurrent && tx.date.localeCompare(currentMonthStr) <= 0;
      
      const val = parseFloat(tx.amount);
      
      if (tx.type === 'investment') totalInvested += val;
      
      if (isCurrentMonth || isPastOrCurrentRecurrent) {
        if (tx.type === 'income') mIncome += val;
        
        if (tx.type === 'expense') {
          mExpense += val;
          let catName = tx.category;
          if (catName === 'Outro' && tx.description) {
            catName = tx.description.charAt(0).toUpperCase() + tx.description.slice(1);
          }
          expenseByCat[catName] = (expenseByCat[catName] || 0) + val;
        }
        
        if (tx.type === 'investment' && isCurrentMonth) mInvested += val;
        
        displayTxs.push(tx);
      }
    });

    setTransactions(displayTxs);
    setMonthlyIncome(mIncome);
    setMonthlyExpense(mExpense);
    setMonthlyInvested(mInvested);
    setAllTimeInvested(totalInvested);
    setExpensesByCategory(expenseByCat);
    setLoadingData(false);
  };

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const resetData = async () => {
    await DataLayer.resetAll();
    setNeedsOnboarding(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleDelete = async (id) => {
    await DataLayer.removeTransaction(id);
    loadData();
  };

  const openGoalEditor = () => {
    setEditBanca(goal.initialBalance || 0);
    setEditMeta(goal.annualGoal || 0);
    setIsEditingGoal(true);
  };

  const saveGoalEdit = async (e) => {
    e.preventDefault();
    await DataLayer.setUserGoal({
      ...goal,
      initialBalance: parseFloat(editBanca),
      annualGoal: parseFloat(editMeta)
    });
    setIsEditingGoal(false);
    loadData();
  };

  if (!session) {
    return <Login />;
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Hexagon size={48} className="text-brand-500 animate-spin" />
      </div>
    );
  }

  if (needsOnboarding) {
    return <Onboarding onComplete={loadData} />;
  }

  const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const initialBalance = goal.initialBalance || 0;
  const bancaTotal = initialBalance + allTimeInvested;
  
  const goalProgressPercent = Math.min(100, (bancaTotal / (goal.annualGoal || 1)) * 100);

  const currentMonthIndex = now.getMonth(); 
  const monthsLeft = Math.max(1, 12 - currentMonthIndex);
  
  const totalInvestedPastMonths = allTimeInvested - monthlyInvested + initialBalance;
  const remainingAnnualGoal = Math.max(0, goal.annualGoal - totalInvestedPastMonths);
  const targetSavePerMonth = remainingAnnualGoal / monthsLeft;
  
  const missingInvestment = Math.max(0, targetSavePerMonth - monthlyInvested);
  const reservedForInvestment = Math.max(targetSavePerMonth, monthlyInvested);

  const totalIncomeThisMonth = goal.income + monthlyIncome;
  const safeToSpend = totalIncomeThisMonth - reservedForInvestment - monthlyExpense;
  const isDanger = safeToSpend <= 0;

  const chartData = Object.entries(expensesByCategory).map(([cat, val]) => {
      return { cat, val, percent: (val / (monthlyExpense || 1)) * 100 };
  }).sort((a,b) => b.val - a.val);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto flex flex-col relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse"></div>

      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex flex-wrap items-center gap-3">
            <Hexagon className="text-brand-400" size={28} strokeWidth={2} /> Painel Tático
            <button onClick={openGoalEditor} className="bg-dark-800/80 hover:bg-dark-700 text-brand-300 text-xs md:text-sm px-3 py-1.5 rounded-lg border border-dark-600 font-medium transition-colors flex items-center gap-2 group shadow-sm" title="Editar Banca e Meta">
              <span className="flex items-center gap-1.5"><Landmark size={14} /> Banca: {formatBRL(bancaTotal)}</span>
              <span className="text-dark-500">|</span>
              <span className="flex items-center gap-1.5"><Target size={14} /> Meta: {formatBRL(goal.annualGoal)}</span>
              <PenLine size={14} className="text-brand-500/0 group-hover:text-brand-500 transition-colors" />
            </button>
          </h1>
          <p className="text-gray-400 text-sm capitalize mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {currentMonthName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={resetData} className="text-xs text-dark-500 hover:text-red-500 transition-colors uppercase tracking-wider font-bold">
            [ Resetar ]
          </button>
          <button onClick={handleLogout} className="text-xs text-dark-400 hover:text-white transition-colors uppercase tracking-wider font-bold flex items-center gap-1 bg-dark-800/50 px-3 py-1.5 rounded-lg">
            <LogOut size={12} /> Sair
          </button>
        </div>
      </header>

      {/* Barra de Progresso Anual */}
      <div className="mb-10 glass-panel p-5 flex items-center gap-6 border-l-4 border-l-brand-500 animate-slide-up delay-100">
        <div className="flex-1">
          <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            <span className="flex items-center gap-2"><Rocket size={14} className="text-brand-400" /> Progresso da Meta Anual</span>
            <span className="text-brand-400">{goalProgressPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-dark-900 rounded-full h-3 border border-dark-800 p-[1px]">
            <div className="bg-gradient-to-r from-brand-600 to-brand-400 h-full rounded-full transition-all duration-1000 relative shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${goalProgressPercent}%` }}>
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px] rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="text-right hidden sm:block border-l border-dark-700 pl-6">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Falta para a Meta</div>
          <div className="text-sm font-bold text-white">{formatBRL(Math.max(0, goal.annualGoal - bancaTotal))}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center mb-12 animate-slide-up delay-200">
        <div className="inline-block px-4 py-1.5 rounded-full bg-dark-800/50 border border-dark-700 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap size={14} className="text-brand-400" /> Livre no Mês
        </div>
        <h2 className={`text-6xl md:text-8xl font-black tracking-tighter mb-8 transition-colors duration-500 ${isDanger ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]'}`}>
          {formatBRL(safeToSpend)}
        </h2>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-500 hover:bg-brand-400 text-white text-lg font-bold py-4 px-12 rounded-full transition-all shadow-[0_8px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.6)] hover:-translate-y-1 active:translate-y-0 flex items-center gap-2 mx-auto"
        >
          <Plus size={20} strokeWidth={3} /> Adicionar Registro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up delay-300">
        <div className="glass-panel p-6 border-t-4 border-t-dark-700">
          <h3 className="text-gray-400 text-sm mb-5 uppercase tracking-wider font-bold flex items-center gap-2">
            <Calculator size={16} /> A Matemática <span className="text-dark-500 capitalize normal-case font-medium">({currentMonthName.split(' ')[0]})</span>
          </h3>
          
          <div className="space-y-4">
            <div className="pb-3 border-b border-dark-800/50">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 flex items-center gap-2"><Briefcase size={16} className="text-dark-400" /> Renda Fixa Base</span>
                <span className="text-green-400 font-medium">{formatBRL(goal.income)}</span>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-gray-300 flex items-center gap-2"><Coins size={16} className="text-dark-400" /> Ganhos Extras/Avulsos</span>
                <span className="text-green-400 font-medium">+{formatBRL(monthlyIncome)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-dark-800/50">
              <span className="text-gray-300 flex items-center gap-2"><ArrowDownRight size={16} className="text-dark-400" /> Gastos Realizados</span>
              <span className="text-red-400 font-medium">-{formatBRL(monthlyExpense)}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-dark-800/50">
              <span className="text-gray-300 flex items-center gap-2"><Landmark size={16} className="text-dark-400" /> Já Investido no Mês</span>
              <span className="text-white font-medium">{formatBRL(monthlyInvested)}</span>
            </div>

            {missingInvestment > 0 && (
              <div className="flex justify-between items-center pt-2 bg-brand-500/5 -mx-4 px-4 py-2 rounded-lg">
                <div>
                  <span className="text-brand-200 block flex items-center gap-2"><ShieldCheck size={16} className="text-brand-400" /> Guarde p/ o Mês</span>
                  <span className="text-xs text-brand-500/60 ml-6">P/ bater a meta anual</span>
                </div>
                <span className="text-brand-400 font-bold">{formatBRL(missingInvestment)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-gray-400 text-sm mb-5 uppercase tracking-wider font-bold flex items-center gap-2">
            <ListOrdered size={16} /> Lançamentos Recentes
          </h3>
          {transactions.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-dark-500">
              <Inbox size={40} className="mb-2 opacity-50" strokeWidth={1} />
              <p className="italic text-sm">Nada registrado neste mês.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center border-b border-dark-800/50 pb-3 last:border-0 hover:bg-dark-800/30 p-2 -mx-2 rounded-lg transition-colors group">
                  <div>
                    <span className="text-gray-200 font-medium flex items-center gap-2">
                      {tx.recurrent && <Repeat size={12} className="text-brand-400" title="Custo Fixo" />}
                      {tx.description}
                    </span>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {new Date(tx.date).toLocaleDateString()} 
                      <span className="ml-2 px-2 py-0.5 bg-dark-800 border border-dark-700 rounded text-[10px] uppercase tracking-wider">{tx.category}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${tx.type === 'income' ? 'text-green-400' : tx.type === 'expense' ? 'text-red-400' : 'text-brand-400'}`}>
                      {tx.type === 'expense' ? '-' : '+'}{formatBRL(tx.amount)}
                    </span>
                    <button onClick={() => handleDelete(tx.id)} className="w-8 h-8 flex items-center justify-center rounded-full text-dark-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" title="Apagar">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel p-6 md:col-span-2 border-t-4 border-t-brand-500 animate-slide-up delay-400">
          <h3 className="text-gray-400 text-sm mb-6 uppercase tracking-wider font-bold flex items-center gap-2">
            <PieChart size={16} /> Raio-X: Onde você está gastando?
          </h3>
          {chartData.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-dark-500">
              <p className="italic text-sm">Ainda sem gastos para gerar o gráfico.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {chartData.map(item => (
                <div key={item.cat} className="group">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{item.cat}</span>
                    <span className="text-gray-400 font-medium group-hover:text-brand-300 transition-colors">{formatBRL(item.val)} <span className="text-xs opacity-50 ml-1">({item.percent.toFixed(0)}%)</span></span>
                  </div>
                  <div className="w-full bg-dark-900 rounded-full h-3 border border-dark-800 p-[1px]">
                    <div className="bg-brand-500 h-full rounded-full transition-all duration-1000 relative shadow-[0_0_8px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_12px_rgba(59,130,246,0.6)]" style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <TransactionModal 
          safeToSpend={safeToSpend}
          missingInvestment={missingInvestment}
          onClose={() => setIsModalOpen(false)} 
          onSave={() => {
            setIsModalOpen(false);
            loadData();
          }} 
        />
      )}

      {isEditingGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-8 max-w-sm w-full animate-fade-scale">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings className="text-brand-400" size={20} /> Editar Meta</h2>
              <button onClick={() => setIsEditingGoal(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={saveGoalEdit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Sua Banca Atual (R$)</label>
                <input required type="number" step="0.01" className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500 transition-colors" value={editBanca} onChange={e => setEditBanca(e.target.value)} />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Meta Anual (R$)</label>
                <input required type="number" step="0.01" className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500 transition-colors" value={editMeta} onChange={e => setEditMeta(e.target.value)} />
              </div>
              
              <button type="submit" className="w-full font-bold py-3.5 rounded-xl mt-6 shadow-lg bg-brand-500 hover:bg-brand-600 text-white transition-all hover:scale-[1.02] active:scale-[0.98]">
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default App
