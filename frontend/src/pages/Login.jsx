import React, { useState } from 'react';
import { Shield, Mail, Lock, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'worker' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.user.role);
        navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        await axios.post('http://localhost:5000/api/auth/register', formData);
        setIsLogin(true); // Switch to login
        setError('Registration successful. Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-dark-900">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="glass-panel p-8 w-full max-w-md z-10 relative mt-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            PayGuard AI
          </h2>
          <p className="text-slate-400 mt-2 text-sm">Automated Parametric Insurance</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Full Name" 
                required
                className="w-full bg-dark-900/50 border border-slate-700 rounded-xl py-3 px-10 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              className="w-full bg-dark-900/50 border border-slate-700 rounded-xl py-3 px-10 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full bg-dark-900/50 border border-slate-700 rounded-xl py-3 px-10 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          {!isLogin && (
            <div className="flex bg-dark-900/50 p-1 rounded-xl border border-slate-700">
              <button type="button" onClick={() => setFormData({...formData, role: 'worker'})} className={clsx("flex-1 py-2 rounded-lg text-sm font-medium transition-all", formData.role === 'worker' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white')}>Gig Worker</button>
              <button type="button" onClick={() => setFormData({...formData, role: 'admin'})} className={clsx("flex-1 py-2 rounded-lg text-sm font-medium transition-all", formData.role === 'admin' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white')}>Admin</button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-500 to-teal-600 hover:from-brand-600 hover:to-teal-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-brand-500 hover:text-brand-400 font-medium cursor-pointer"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
