import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Sun, Moon, Menu, User, LogOut, X, Bell } from 'lucide-react';
import AuthModal from './AuthModal';
import { getNotifications, markRead, markAllRead } from '../services/api';

export default function Navbar({ session, theme, setTheme, setShowAuth }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      const fetchNotifs = () => {
        getNotifications(session.access_token).then(setNotifications).catch(console.error);
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [session]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = async (n) => {
    setNotificationsOpen(false);
    if (!n.is_read) {
      setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif));
      markRead(n.id, session.access_token).catch(console.error);
    }
    navigate(`/?story=${n.story_id}`);
  };

  const markAllAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    markAllRead(session.access_token).catch(console.error);
  };

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

          {session && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => { setNotificationsOpen(!notificationsOpen); setMenuOpen(false); }}
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)',
                  padding: '8px', display: 'flex', alignItems: 'center', position: 'relative'
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px',
                    background: '#E53E3E', borderRadius: '50%', border: '2px solid var(--color-navbar-bg)'
                  }} />
                )}
              </button>

              {notificationsOpen && (
                <div 
                  className="animate-fade-in"
                  style={{
                    position: 'absolute', top: '50px', right: 0, width: '280px',
                    maxHeight: '400px', overflowY: 'auto',
                    background: 'var(--color-card-bg)', border: '1px solid var(--color-border)',
                    borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    padding: '8px', zIndex: 2100
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', marginBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.6, textTransform: 'uppercase' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => { markAllAllRead(); }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, fontSize: '13px' }}>No alerts yet...</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          padding: '12px', borderRadius: '8px', cursor: 'pointer',
                          background: n.is_read ? 'transparent' : 'rgba(232, 117, 74, 0.05)',
                          display: 'flex', gap: '12px', marginBottom: '4px', transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--color-glass)'}
                        onMouseOut={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(232, 117, 74, 0.05)'}
                      >
                        <img src={n.actor_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${n.actor_name}`} style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} alt="" />
                        <div style={{ flex: 1 }}>
                           <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                              <strong>{n.actor_name}</strong> 
                              {n.type === 'comment' && ' shared a reflection on '}
                              {n.type === 'reply' && ' replied to your whisper on '}
                              {n.type === 'thread' && ' added a new chapter to '}
                              <strong>"{n.story_title}"</strong>
                           </div>
                           <div style={{ fontSize: '11px', opacity: 0.4, marginTop: '4px' }}>
                             {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                           </div>
                        </div>
                        {!n.is_read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', marginTop: '6px' }} />}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { setMenuOpen(!menuOpen); setNotificationsOpen(false); }}
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

