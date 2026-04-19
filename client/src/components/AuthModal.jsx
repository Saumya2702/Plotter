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
        toast.success("Account created! Check your email if verification is required.");
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
      background: 'rgba(0,0,0,0.6)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="animate-fade-in" style={{
        background: 'var(--color-card-bg)', color: 'var(--color-text)', borderRadius: '24px',
        width: '100%', maxWidth: '400px', padding: '40px', position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid var(--color-border)'
      }}>
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', top: '24px', right: '24px', background: 'none', 
            border: 'none', cursor: 'pointer', color: 'var(--color-text)', opacity: 0.5 
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          {mode === 'signin' ? 'Sign In' : 'Join Plotter'}
        </h2>
        <p style={{ margin: '0 0 32px 0', opacity: 0.6, fontSize: '14px' }}>
          {mode === 'signin' ? 'Continue your journey' : 'Start chronicling your stories'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', opacity: 0.8 }}>Email</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{ 
                width: '100%', padding: '12px 16px', borderRadius: '12px', 
                border: '1px solid var(--color-border)', fontSize: '15px', 
                background: 'rgba(0,0,0,0.02)', color: 'var(--color-text)',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', opacity: 0.8 }}>Password</label>
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ 
                width: '100%', padding: '12px 16px', borderRadius: '12px', 
                border: '1px solid var(--color-border)', fontSize: '15px', 
                background: 'rgba(0,0,0,0.02)', color: 'var(--color-text)',
                outline: 'none'
              }}
            />
          </div>
          
          <button type="submit" disabled={loading} style={{
            background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '14px',
            borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', 
            marginTop: '12px', boxShadow: '0 4px 15px rgba(232,117,74,0.3)'
          }}>
            {loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', opacity: 0.8 }}>
          {mode === 'signin' ? (
            <span>New here? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }} style={{ color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'none' }}>Create an account</a></span>
          ) : (
            <span>Already a member? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signin'); }} style={{ color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'none' }}>Sign in here</a></span>
          )}
        </div>
      </div>
    </div>
  );
}
