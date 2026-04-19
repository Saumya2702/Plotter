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
      <Navbar session={session} />
      <Routes>
        <Route path="/" element={<MapView session={session} />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/users/:id" element={<Profile />} />
      </Routes>
    </Router>
  );
}
