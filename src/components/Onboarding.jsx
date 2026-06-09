import { useState } from 'react';
import { DataLayer } from '../lib/data';

export default function Onboarding({ onComplete }) {
  const [income, setIncome] = useState('');
  const [annualGoal, setAnnualGoal] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  const handleSave = () => {
    if (!income || !annualGoal) return;
    
    localStorage.removeItem('transactions');
    
    DataLayer.setUserGoal({ 
      income: parseFloat(income), 
      annualGoal: parseFloat(annualGoal),
      initialBalance: parseFloat(initialBalance || 0)
    });
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-8 max-w-md w-full animate-slide-up relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-brand-500/20 rounded-full blur-[50px] -z-10"></div>

        <div className="text-center mb-6">
          <div className="text-5xl mb-4 animate-float">🌌</div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Configuração Mestra</h2>
          <p className="text-gray-400 mt-2 text-sm">Insira seus dados para calibrar a inteligência do app e ativar o painel.</p>
        </div>
        
        <div className="space-y-5">
          <div className="group">
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2"><span className="text-lg">🏦</span> Banca Atual / Guardado</label>
            <p className="text-xs text-gray-500 mb-2">O patrimônio acumulado antes do app.</p>
            <input type="number" className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500 transition-colors group-hover:border-dark-600" placeholder="Ex: 15000" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} />
          </div>

          <div className="group">
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2"><span className="text-lg">🏢</span> Renda Fixa Mensal</label>
            <p className="text-xs text-gray-500 mb-2">Se for 100% autônomo, coloque 0 e adicione ganhos no dia a dia.</p>
            <input type="number" className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500 transition-colors group-hover:border-dark-600" placeholder="Ex: 5000" value={income} onChange={(e) => setIncome(e.target.value)} />
          </div>
          
          <div className="group">
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2"><span className="text-lg">🎯</span> Meta Anual</label>
            <p className="text-xs text-gray-500 mb-2">Onde você quer chegar até dezembro.</p>
            <input type="number" className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500 transition-colors group-hover:border-dark-600" placeholder="Ex: 12000" value={annualGoal} onChange={(e) => setAnnualGoal(e.target.value)} />
          </div>
          
          <button onClick={handleSave} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl mt-8 shadow-[0_8px_20px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]">
            Ligar Motores 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
