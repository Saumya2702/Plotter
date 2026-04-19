import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Sun, Moon, Menu, User, LogOut, X } from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar({ session, theme, setTheme, setShowAuth }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '72px',
        background: 'var(--color-navbar-bg)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 2000, borderBottom: '1px solid var(--color-border)'
      }}>
        
        {/* Left: Branding */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
           <img src="/logo.png" alt="Plotter Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
           <span style={{ 
             fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px', 
             color: 'var(--color-text)', display: 'flex', alignItems: 'center' 
           }}>
             Plotter
           </span>
        </Link>

        {/* Center: Heading (Hidden on mobile) */}
        <div 
          className="nav-center-heading"
          style={{ 
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            color: 'var(--color-text)', opacity: 0.8, fontSize: '15px', 
            fontWeight: '500', letterSpacing: '0.2px', pointerEvents: 'none',
          }}
        >
          Seek the stories marked upon the map
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          <button onClick={toggleTheme} style={{ 
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)',
            padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center'
          }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {!session && (
            <button 
              onClick={() => setShowAuth(true)}
              style={{
                background: 'var(--color-primary)', color: '#fff', border: 'none',
                padding: '6px 14px', borderRadius: '20px', fontWeight: '700',
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)',
                padding: '8px', display: 'flex', alignItems: 'center' 
              }}
            >
              <Menu size={22} />
            </button>

            {menuOpen && (
              <div 
                className="animate-fade-in"
                style={{
                  position: 'absolute', top: '50px', right: 0, width: '180px',
                  background: 'var(--color-card-bg)', border: '1px solid var(--color-border)',
                  borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  padding: '8px', overflow: 'hidden'
                }}
              >
                {session ? (
                  <>
                    <Link to={`/users/${session.user.id}`} onClick={() => setMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                      textDecoration: 'none', color: 'var(--color-text)', borderRadius: '8px',
                      transition: 'background 0.2s', fontSize: '14px'
                    }} onMouseOver={e => e.currentTarget.style.background = 'var(--color-glass)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <User size={16} /> <span>Your Profile</span>
                    </Link>
                    <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />
                    <button onClick={handleLogout} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                      background: 'none', border: 'none', color: '#E53E3E', borderRadius: '8px',
                      cursor: 'pointer', textAlign: 'left', fontWeight: '500', fontSize: '14px'
                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(229, 62, 62, 0.1)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <LogOut size={16} /> <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div style={{ padding: '12px', textAlign: 'center', opacity: 0.6, fontSize: '13px' }}>
                    Sign in to see more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* AuthModal is now handled in App.jsx */}
    </>
  );
}

