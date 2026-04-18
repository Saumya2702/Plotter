import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { MapPin, Search, User, LogIn, LogOut, Plus, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthModal from './AuthModal';

export default function Navbar({ session, theme, setTheme }) {
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const startDropMode = () => {
    if (!session) {
      toast.error("Please sign in to drop a story!");
      return;
    }
    toast.success("Click anywhere on the map to select a location!", { duration: 4000 });
    window.dispatchEvent(new Event('enter-drop-mode'));
  };

  return (
    <>
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', zIndex: 10, background: theme === 'dark' ? 'rgba(27, 27, 27, 0.4)' : 'rgba(237, 224, 212, 0.7)',
        backdropFilter: 'blur(12px)', borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
        color: theme === 'dark' ? 'var(--color-accent)' : 'var(--color-bg)'
      }}>
        <Link to="/" style={{ fontSize: '22px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="Plotter Logo" width={40} height={48} style={{ objectFit: 'contain' }} /> Plotter
        </Link>

        <div>
          <button
            onClick={startDropMode}
            style={{
              background: 'var(--color-memory)', color: '#fff', border: 'none',
              padding: '8px 20px', borderRadius: '30px', fontWeight: '600',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 12px rgba(29, 158, 117, 0.4)', fontSize: '15px'
            }}
          >
            <Plus size={18} /> Drop a story
          </button>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.8, display: 'flex', alignItems: 'center' }}>
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <Link to="/explore" style={{ opacity: 0.8, display: 'flex', alignItems: 'center' }}><Search size={22} /></Link>
          {session ? (
            <>
              <Link to={`/users/${session.user.id}`} style={{ opacity: 0.8, display: 'flex', alignItems: 'center' }}><User size={22} /></Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  toast.success("Successfully logged out");
                  navigate('/');
                }}
                style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.8, display: 'flex', alignItems: 'center' }}
              >
                <LogOut size={22} />
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{
              background: 'var(--color-accent)', color: 'var(--color-bg)', border: 'none',
              padding: '8px 16px', borderRadius: '20px', fontWeight: '600',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <LogIn size={16} /> Sign In
            </button>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
