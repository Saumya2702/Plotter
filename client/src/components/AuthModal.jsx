import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! You are now logged in.");
        onClose();
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        onClose();
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--color-accent)', color: 'var(--color-bg)', borderRadius: '16px',
        width: '100%', maxWidth: '400px', padding: '24px', position: 'relative'
      }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
        >
          <X />
        </button>

        <h2 style={{ margin: '0 0 20px 0' }}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Email</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', background: 'var(--color-accent)', color: 'inherit' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Password</label>
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', background: 'var(--color-accent)', color: 'inherit' }}
            />
          </div>
          
          <button type="submit" disabled={loading} style={{
            background: 'var(--color-primary)', color: 'var(--color-accent)', border: 'none', padding: '12px',
            borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '8px'
          }}>
            {loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          {mode === 'signin' ? (
            <span>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign up</a></span>
          ) : (
            <span>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signin'); }} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</a></span>
          )}
        </div>
      </div>
    </div>
  );
}
