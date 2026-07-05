import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';
import { useExpenseStore } from './store/useExpenseStore';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import AddExpense from './screens/AddExpense';
import Groups from './screens/Groups';
import Settings from './screens/Settings';
import Auth from './screens/Auth';

export default function App() {
  const { session, setSession, loading } = useAuthStore();
  const fetchData = useExpenseStore(state => state.fetchData);

  useEffect(() => {
    if (!supabase) return;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p>Loading...</p></div>;
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Configuration Error</h1>
        <p className="text-lg mb-2">The application is missing its Supabase database connection details.</p>
        <p className="mb-4">This usually happens because the <b>VITE_SUPABASE_URL</b> and <b>VITE_SUPABASE_ANON_KEY</b> secrets are missing in GitHub.</p>
        <div className="bg-card p-6 rounded-lg border text-left max-w-2xl">
          <h2 className="font-semibold mb-2">How to fix this:</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Go to your GitHub Repository Settings</li>
            <li>Click <b>Secrets and variables</b> -> <b>Actions</b> in the left sidebar</li>
            <li>Click <b>New repository secret</b></li>
            <li>Add <code>VITE_SUPABASE_URL</code> with your Supabase project URL</li>
            <li>Add <code>VITE_SUPABASE_ANON_KEY</code> with your Supabase anon key</li>
            <li>Go to the <b>Actions</b> tab, click the latest workflow, and click <b>Re-run all jobs</b></li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" replace />} />
        
        <Route path="/" element={session ? <Layout /> : <Navigate to="/auth" replace />}>
          <Route index element={<Dashboard />} />
          <Route path="add" element={<AddExpense />} />
          <Route path="groups" element={<Groups />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
