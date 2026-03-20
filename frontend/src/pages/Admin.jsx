import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, ShieldAlert, CloudLightning, Activity, PlayCircle, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simTarget, setSimTarget] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const navigate = useNavigate();

  const [simForm, setSimForm] = useState({
    weather_condition: 'heavy_rain',
    rainfall_mm: 70,
    aqi: 150,
    location: 'Mumbai'
  });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const runSimulation = async (e) => {
    e.preventDefault();
    setSimLoading(true);
    setSimResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/trigger/simulate', {
        ...simForm,
        targetUserId: simTarget || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSimResult(res.data);
      fetchStats(); // refresh stats
    } catch (err) {
      setSimResult({ error: err.response?.data?.message || err.message, success: false });
    }
    setSimLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><div className="animate-pulse-slow w-16 h-16 bg-brand-500 rounded-full blur-xl" /></div>;

  return (
    <div className="min-h-screen bg-dark-900 pb-20">
      <nav className="border-b border-slate-700/50 bg-dark-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">PayGuard Admin</span>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer p-2 rounded-lg hover:bg-slate-700/50">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 border-indigo-500/20 shadow-indigo-500/5">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl"><Users className="w-6 h-6" /></div>
              <p className="text-slate-400 font-medium text-sm">Total Users</p>
            </div>
            <h3 className="text-3xl font-bold text-white pl-16">{stats?.usersCount}</h3>
          </div>
          
          <div className="glass-panel p-6 border-emerald-500/20 shadow-emerald-500/5">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><ShieldAlert className="w-6 h-6" /></div>
              <p className="text-slate-400 font-medium text-sm">Active Policies</p>
            </div>
            <h3 className="text-3xl font-bold text-white pl-16">{stats?.activePolicies}</h3>
          </div>

          <div className="glass-panel p-6 border-amber-500/20 shadow-amber-500/5">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl"><Activity className="w-6 h-6" /></div>
              <p className="text-slate-400 font-medium text-sm">Total Payouts Done</p>
            </div>
            <h3 className="text-3xl font-bold text-white pl-16">₹{stats?.totalPayouts?.toFixed(2) || '0.00'}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulator Panel */}
          <div className="lg:col-span-1 glass-panel p-6">
            <div className="flex items-center gap-2 mb-6">
              <CloudLightning className="w-5 h-5 text-brand-400" />
              <h3 className="font-semibold text-lg text-white">Trigger Simulator</h3>
            </div>
            
            <form onSubmit={runSimulation} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Target User ID</label>
                <input 
                  required
                  type="text" 
                  placeholder="Mongo ObjectId"
                  className="w-full bg-dark-900/50 border border-slate-700/50 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  value={simTarget}
                  onChange={e => setSimTarget(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Weather Condition</label>
                <select 
                  className="w-full bg-dark-900/50 border border-slate-700/50 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  value={simForm.weather_condition}
                  onChange={e => setSimForm({...simForm, weather_condition: e.target.value})}
                >
                  <option value="clear">Clear</option>
                  <option value="rain">Light Rain</option>
                  <option value="heavy_rain">Heavy Rain</option>
                  <option value="storm">Storm</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Rainfall (mm)</label>
                  <input 
                    type="number" 
                    className="w-full bg-dark-900/50 border border-slate-700/50 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                    value={simForm.rainfall_mm}
                    onChange={e => setSimForm({...simForm, rainfall_mm: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">AQI Level</label>
                  <input 
                    type="number" 
                    className="w-full bg-dark-900/50 border border-slate-700/50 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                    value={simForm.aqi}
                    onChange={e => setSimForm({...simForm, aqi: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={simLoading || !simTarget}
                className="w-full mt-4 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {simLoading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <PlayCircle className="w-5 h-5"/>}
                Run Trigger Engine
              </button>
            </form>

            {simResult && (
              <div className={clsx("mt-6 p-4 rounded-xl border", simResult.error || !simResult.success ? "bg-red-500/10 border-red-500/20" : "bg-brand-500/10 border-brand-500/20")}>
                <p className="text-sm font-medium text-white mb-1">Result:</p>
                <p className={clsx("text-sm", simResult.error || !simResult.success ? "text-red-400" : "text-brand-400")}>
                  {simResult.message || simResult.error}
                </p>
                {simResult.data && (
                  <div className="mt-2 text-xs text-slate-400 bg-dark-900/50 p-2 rounded">
                    Risk Score: {simResult.data.riskScore} <br/>
                    Payout generated: ₹{simResult.data.payoutAmount}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="lg:col-span-2 glass-panel p-6">
            <h3 className="font-semibold text-lg text-white mb-6">Recent Automated Payouts & Triggers</h3>
            <div className="space-y-4">
              {stats?.recentTriggers?.length > 0 ? (
                stats.recentTriggers.map(t => (
                  <div key={t._id} className="flex justify-between items-center p-4 bg-dark-700/50 border border-slate-700/50 rounded-xl">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 bg-slate-700 text-slate-300 rounded uppercase tracking-wider">{t.eventType}</span>
                        <span className="text-sm font-medium text-white">{t.userId?.name || 'Unknown User'}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Risk Score {t.riskScore} • AI Confidence: {t.aiPrediction?.confidence_score} • {new Date(t.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      {t.payoutAmount > 0 ? (
                        <span className="font-bold text-emerald-400">Triggered ₹{t.payoutAmount.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-500 text-sm">No Payout</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-10">No trigger logs available yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
