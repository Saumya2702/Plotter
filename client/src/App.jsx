import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './supabaseClient';

import MapView from './components/Map';
import Navbar from './components/Navbar';
import Explore from './pages/Explore';
import Profile from './pages/Profile';

export default function App() {
  const [session, setSession] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

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

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ style: { background: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#111' } }} />
      <Navbar session={session} theme={theme} setTheme={setTheme} />
      <Routes>
        <Route path="/" element={<MapView session={session} theme={theme} />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/users/:id" element={<Profile />} />
      </Routes>
    </Router>
  );
}
