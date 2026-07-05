import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) {
      alert("Supabase is not configured! Please add your keys to the .env file.");
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setEmail('');
        setPassword('');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setEmail('');
        setPassword('');
        alert("Check your email for the confirmation link!");
      }
    } catch (error) {
      console.error("Auth error:", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl border border-indigo-500/30 bg-[#161a2b] flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
          <Lock className="text-indigo-400" size={28} strokeWidth={1.5} />
        </div>

        {/* Portal Badge */}
        <div className="bg-[#161a2b] px-4 py-1.5 rounded-full border border-indigo-500/20 mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-300/80">
            Trackent Shield Portal
          </span>
        </div>

        {/* Title */}
        <h1 className="text-[28px] font-black tracking-tight text-white mb-4 text-center">
          {isLogin ? 'Establish Your Private Profile' : 'Create Your Secure Profile'}
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-400/80 text-[15px] mb-8 px-2 leading-relaxed">
          Create a secure dashboard to track your expenses, manage group budgets, and control your finances safely in the cloud.
        </p>

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="w-full space-y-4 mb-6" autoComplete="off">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <Mail size={20} />
            </span>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#161a2b] border border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600"
              autoComplete="off"
              required
            />
          </div>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <Key size={20} />
            </span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#161a2b] border border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-gray-400 text-sm hover:text-white transition-colors mb-8"
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>

      </div>
    </div>
  );
}
