import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Hexagon, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const [successMsg, setSuccessMsg] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (isSignUp) {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else if (!data.session) {
        setSuccessMsg('Conta criada! Cheque seu e-mail para confirmar e fazer login (olhe o spam).');
        setIsSignUp(false);
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px] -z-10 animate-pulse"></div>

      <div className="glass-panel p-8 max-w-sm w-full animate-slide-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 animate-float text-brand-400">
            <Hexagon size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Triforce Finance</h2>
          <p className="text-gray-400 mt-2 text-sm">Acesso restrito. {isSignUp ? 'Crie sua conta.' : 'Identifique-se.'}</p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl text-center">
              {error === 'Invalid login credentials' ? 'Credenciais inválidas.' : error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-sm p-3 rounded-xl text-center">
              {successMsg}
            </div>
          )}

          <div className="group">
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <Mail size={16} className="text-brand-400" /> E-mail
            </label>
            <input 
              required type="email" 
              className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500 transition-colors group-hover:border-dark-600" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="group">
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <Lock size={16} className="text-brand-400" /> Senha
            </label>
            <input 
              required type="password" 
              className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500 transition-colors group-hover:border-dark-600" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl mt-8 shadow-[0_8px_20px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (
              <>{isSignUp ? 'Criar Conta' : 'Acessar Painel'} <ArrowRight size={18} strokeWidth={2.5} /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            {isSignUp ? 'Já tem conta? Faça login' : 'Não tem acesso? Crie uma conta'}
          </button>
        </div>
      </div>
    </div>
  );
}
