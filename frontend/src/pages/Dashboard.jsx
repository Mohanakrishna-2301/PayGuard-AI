import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, Wallet, ShieldCheck, ShieldAlert, AlertTriangle, ArrowUpRight, Activity } from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/user/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const buyPolicy = async () => {
    setPurchasing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/policy/subscribe', {
        planName: 'Premium Weekly',
        premiumAmount: 50,
        coverageAmount: 2000
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboard();
    } catch (err) {
      alert('Failed to purchase policy');
    }
    setPurchasing(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark-900"><div className="animate-pulse-slow w-16 h-16 bg-brand-500 rounded-full blur-xl" /></div>;

  return (
    <div className="min-h-screen bg-dark-900 pb-20">
      <nav className="border-b border-slate-700/50 bg-dark-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">PayGuard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">{data?.user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{data?.user?.location} • {data?.user?.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Wallet & Risk Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 bg-gradient-to-br from-dark-800/80 to-dark-700/40">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-brand-500/20 text-brand-400 rounded-xl">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-brand-500/10 text-brand-400 rounded-full">Available Balance</span>
            </div>
            <h3 className="text-4xl font-bold text-white mb-1">₹{data?.user?.walletBalance?.toFixed(2) || '0.00'}</h3>
            <p className="text-sm text-slate-400">Total earnings & payouts</p>
          </div>

          <div className="glass-panel p-6 border-brand-500/20 shadow-brand-500/5 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-700/50 text-slate-300 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
              {data?.activePolicy ? (
                <span className="text-xs font-medium px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Policy
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-1 bg-red-500/20 text-red-400 rounded-full border border-red-500/20">
                  No Active Policy
                </span>
              )}
            </div>
            
            {data?.activePolicy ? (
              <div>
                <h3 className="text-xl font-bold text-white">{data.activePolicy.planName}</h3>
                <div className="flex justify-between mt-2 text-sm text-slate-400">
                  <span>Coverage: <strong className="text-slate-200">₹{data.activePolicy.coverageAmount}</strong></span>
                  <span>Expires: <strong className="text-slate-200">{new Date(data.activePolicy.endDate).toLocaleDateString()}</strong></span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Protect your earnings today</h3>
                <button 
                  onClick={buyPolicy} 
                  disabled={purchasing}
                  className="w-full bg-white text-dark-900 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors shadow-lg cursor-pointer disabled:opacity-70"
                >
                  {purchasing ? 'Processing...' : 'Buy Premium Plan (₹50/week)'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Triggers logged for the user */}
        {data?.recentTriggers?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Recent Risk Events
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.recentTriggers.map(t => (
                <div key={t._id} className="glass-card p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-slate-400">{new Date(t.timestamp).toLocaleDateString()}</span>
                    <span className={clsx("text-xs font-bold px-2 py-1 rounded", t.payoutAmount > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-300")}>
                      {t.payoutAmount > 0 ? `Paid ₹${t.payoutAmount}` : 'No Payout'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white capitalize">{t.eventType}</h4>
                  <p className="text-sm text-slate-400 mt-1">Risk Score: {t.riskScore}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Transactions</h3>
          {data?.transactions?.length > 0 ? (
            <div className="space-y-4">
              {data.transactions.map(tx => (
                <div key={tx._id} className="flex items-center justify-between p-3 hover:bg-dark-700/30 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", tx.type === 'credit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300')}>
                      <ArrowUpRight className={clsx("w-5 h-5", tx.type !== 'credit' && "rotate-180")} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tx.description}</p>
                      <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={clsx("font-bold", tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-300')}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <div className="w-16 h-16 mx-auto bg-dark-700/50 rounded-full flex items-center justify-center mb-3">
                <Wallet className="w-6 h-6 opacity-50" />
              </div>
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
