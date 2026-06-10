import { useState } from 'react';
import { DataLayer } from '../lib/data';
import { PlusCircle, X } from 'lucide-react';

const CATEGORIES = {
  income: ['Salário', 'Freelance', 'Rendimento', 'Cashback', 'Outro'],
  expense: ['Moradia/Contas', 'Mercado', 'Alimentação/Delivery', 'Transporte/Uber', 'Lazer', 'Saúde', 'Outro'],
  investment: ['Renda Fixa', 'Ações', 'Cripto', 'Reserva de Emergência', 'Outro']
};

export default function TransactionModal({ onClose, onSave, safeToSpend, missingInvestment }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES['expense'][0]);
  const [description, setDescription] = useState('');
  const [isRecurrent, setIsRecurrent] = useState(false);

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(CATEGORIES[newType][0]);
    setIsRecurrent(false);
  };

  const parsedAmount = parseFloat(amount) || 0;
  
  const limitForTransaction = type === 'investment' ? safeToSpend + missingInvestment : safeToSpend;
  
  const isOverLimit = type !== 'income' && parsedAmount > limitForTransaction;
  const isWarning = type !== 'income' && parsedAmount > 0 && parsedAmount > (limitForTransaction * 0.8) && !isOverLimit;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isOverLimit) return;
    
    DataLayer.addTransaction({
      type,
      amount: parsedAmount,
      category,
      description: description || category,
      recurrent: type === 'expense' ? isRecurrent : false
    });
    onSave();
  };

  const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-panel p-8 max-w-sm w-full animate-fade-scale">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PlusCircle size={20} className="text-brand-400" /> Novo Registro
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-3 gap-2 bg-dark-900/50 p-1 rounded-xl border border-dark-800">
            <button type="button" onClick={() => handleTypeChange('income')} className={`p-2 rounded-lg text-sm font-medium transition-all duration-300 ${type==='income' ? 'bg-green-500/20 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}>Ganho</button>
            <button type="button" onClick={() => handleTypeChange('expense')} className={`p-2 rounded-lg text-sm font-medium transition-all duration-300 ${type==='expense' ? 'bg-red-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}>Gasto</button>
            <button type="button" onClick={() => handleTypeChange('investment')} className={`p-2 rounded-lg text-sm font-medium transition-all duration-300 ${type==='investment' ? 'bg-brand-500/20 text-brand-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}>Investir</button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Qual o valor? (R$)</label>
            <input required autoFocus type="number" step="0.01" className={`w-full text-3xl font-black bg-dark-900 border rounded-xl p-4 text-white focus:outline-none transition-colors ${isOverLimit ? 'border-red-500/50 text-red-400' : isWarning ? 'border-yellow-500/50 text-yellow-400' : 'border-dark-700 focus:border-brand-500'}`} placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
            
            {type !== 'income' && amount > 0 && (
              <div className={`text-xs mt-2 font-medium ${isOverLimit ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-gray-400'}`}>
                {isOverLimit 
                  ? `⚠️ Saldo insuficiente! Faltam ${formatBRL(parsedAmount - limitForTransaction)}.` 
                  : `Após isso, restará: ${formatBRL(limitForTransaction - parsedAmount)}`}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Categoria</label>
            <div className="relative">
              <select className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white appearance-none focus:outline-none focus:border-brand-500 transition-colors" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES[type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">▼</div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nota / Detalhe (Opcional)</label>
            <input type="text" placeholder="Ex: Mercado Assaí, Tesouro IPCA..." className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500 transition-colors" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          {type === 'expense' && (
            <div className="flex items-center mt-2 p-3 bg-dark-900 border border-dark-800 rounded-xl transition-colors hover:border-dark-700">
              <input type="checkbox" id="recurrent" className="mr-3 w-4 h-4 accent-brand-500" checked={isRecurrent} onChange={e => setIsRecurrent(e.target.checked)} />
              <label htmlFor="recurrent" className="text-sm text-gray-300 cursor-pointer select-none flex-1">É um Custo Fixo Mensal?</label>
            </div>
          )}

          <button disabled={isOverLimit} type="submit" className={`w-full font-bold py-3.5 rounded-xl mt-6 shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all ${isOverLimit ? 'bg-dark-800 text-dark-500 cursor-not-allowed border border-dark-700' : 'bg-brand-500 hover:bg-brand-400 text-white hover:-translate-y-0.5 active:translate-y-0'}`}>
            Confirmar
          </button>
        </form>
      </div>
    </div>
  );
}
