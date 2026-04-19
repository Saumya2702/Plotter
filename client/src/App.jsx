import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './supabaseClient';

import MapView from './components/Map';
import Navbar from './components/Navbar';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import AuthModal from './components/AuthModal';

export default function App() {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('plotter_theme') || 'dark');

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : '';
    localStorage.setItem('plotter_theme', theme);
  }, [theme]);

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
  }, []);

  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1A1A2E', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <Navbar session={session} theme={theme} setTheme={setTheme} setShowAuth={setShowAuth} />
      <Routes>
        <Route path="/" element={<MapView session={session} theme={theme} setShowAuth={setShowAuth} />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/users/:id" element={<Profile />} />
      </Routes>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </Router>
  );
}
