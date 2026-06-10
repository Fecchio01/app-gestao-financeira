import { supabase } from './supabase';

export const DataLayer = {
  async getUserGoal() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching goal:', error);
      return null;
    }
    
    if (data) {
      return {
        income: Number(data.income),
        annualGoal: Number(data.annual_goal),
        initialBalance: Number(data.initial_balance)
      };
    }
    return null;
  },

  async setUserGoal(goalData) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const payload = {
      user_id: session.user.id,
      income: goalData.income,
      annual_goal: goalData.annualGoal,
      initial_balance: goalData.initialBalance
    };

    const { error } = await supabase
      .from('user_goals')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) console.error('Error setting goal:', error);
  },

  async getTransactions() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data;
  },

  async addTransaction(tx) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const payload = {
      user_id: session.user.id,
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description,
      recurrent: tx.recurrent
    };

    const { error } = await supabase
      .from('transactions')
      .insert(payload);

    if (error) console.error('Error adding transaction:', error);
  },

  async removeTransaction(id) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) console.error('Error deleting transaction:', error);
  },
  
  async resetAll() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('transactions').delete().eq('user_id', session.user.id);
    await supabase.from('user_goals').delete().eq('user_id', session.user.id);
  }
};
