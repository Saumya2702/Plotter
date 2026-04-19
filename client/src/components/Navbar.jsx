import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Search, User, LogIn, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import AuthModal from './AuthModal';

export default function Navbar({ session }) {
  const [showAuth, setShowAuth] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      if (res.data && res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        if (location.pathname !== '/') {
          navigate(`/?lat=${lat}&lng=${lon}`);
        } else {
          window.dispatchEvent(new CustomEvent('map-fly-to', { 
            detail: { lat: parseFloat(lat), lng: parseFloat(lon), name: display_name } 
          }));
        }
        setSearchQuery('');
      } else {
        toast.error('Location not found');
      }
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const navPills = [
    { label: 'Explore', path: '/' },
    { label: 'Nearby', path: '/?filter=nearby' },
    { label: 'Trending', path: '/?filter=trending' }
  ];

  return (
    <>
      <nav className="glass-panel" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', zIndex: 2000, borderTop: 'none', borderLeft: 'none', borderRight: 'none'
      }}>
        {/* Left: Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 10px var(--color-primary)' }}></div>
          <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', color: '#fff' }}>Plotter</span>
        </Link>

        {/* Center: Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {navPills.map(pill => {
            const isActive = location.pathname === pill.path || (pill.path !== '/' && location.search.includes(pill.path.split('?')[1]));
            return (
              <Link 
                key={pill.label} 
                to={pill.path} 
                className={`glass-pill ${isActive ? 'active' : ''}`}
                style={{ fontSize: '14px', fontWeight: '600' }}
              >
                {pill.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Search + Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} 
            />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search place..."
              disabled={searching}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px', padding: '8px 16px 8px 38px', color: '#fff', fontSize: '14px',
                width: '180px', outline: 'none', transition: 'width 0.3s'
              }}
              onFocus={e => e.target.style.width = '240px'}
              onBlur={e => e.target.style.width = '180px'}
            />
          </form>

          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to={`/users/${session.user.id}`} style={{
                width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', 
                border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <img 
                  src={session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${session.user.id}`} 
                  alt="Avatar" 
                />
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                title="Log Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuth(true)}
              style={{
                background: 'var(--color-primary)', color: '#fff', border: 'none',
                padding: '8px 20px', borderRadius: '20px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={e => e.target.style.background = 'var(--color-primary-hover)'}
              onMouseOut={e => e.target.style.background = 'var(--color-primary)'}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
