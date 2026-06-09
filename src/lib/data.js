export const DataLayer = {
  get: (key) => JSON.parse(localStorage.getItem(key) || 'null'),
  set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
  
  getUserGoal: () => DataLayer.get('user_goal'),
  setUserGoal: (goalData) => DataLayer.set('user_goal', goalData),

  getTransactions: () => DataLayer.get('transactions') || [],
  addTransaction: (tx) => {
    const txs = DataLayer.getTransactions();
    tx.id = Date.now().toString();
    tx.date = new Date().toISOString();
    txs.push(tx);
    DataLayer.set('transactions', txs);
    return tx;
  },
  removeTransaction: (id) => {
    let txs = DataLayer.getTransactions();
    txs = txs.filter(t => t.id !== id);
    DataLayer.set('transactions', txs);
  }
};
