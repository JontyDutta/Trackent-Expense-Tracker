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
