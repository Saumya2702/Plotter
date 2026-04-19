import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { searchStories } from '../services/api';

export default function Explore() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setSearching(true);
    try {
      const data = await searchStories(q);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ marginTop: '72px', minHeight: 'calc(100vh - 72px)', background: '#0F0C1E', color: '#fff' }}>
      <div style={{ padding: '60px 32px', maxWidth: '800px', margin: '0 auto' }} className="animate-fade-in">
        <h1 style={{ fontFamily: 'var(--font-story)', fontSize: '42px', fontWeight: 'bold', marginBottom: '8px' }}>
          Explore the Unseen
        </h1>
        <p style={{ opacity: 0.6, marginBottom: '40px', fontSize: '16px' }}>
          Search for legends, memories, and myths across the map.
        </p>

        <form onSubmit={search} style={{ display: 'flex', gap: '12px', marginBottom: '60px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search 
              size={20} 
              style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} 
            />
            <input 
              value={q} 
              onChange={e => setQ(e.target.value)} 
              placeholder="Search for a keyword or place..."
              disabled={searching}
              style={{
                width: '100%', padding: '16px 20px 16px 54px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px', outline: 'none'
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={searching}
            style={{ 
              padding: '0 32px', borderRadius: '40px', background: 'var(--color-primary)', 
              color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {searching ? '...' : 'Search'}
          </button>
        </form>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          {results.length === 0 && !searching && q && (
            <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '40px' }}>No stories found for "{q}"</div>
          )}
          {results.map(r => (
            <div key={r.id} className="glass-panel" style={{ padding: '32px', borderRadius: '16px', cursor: 'pointer' }}>
               <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                 <span style={{ 
                   fontSize: '10px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', 
                   color: `var(--color-${r.category})`, border: `1px solid var(--color-${r.category})`,
                   padding: '2px 10px', borderRadius: '4px'
                 }}>
                   {r.category}
                 </span>
                 <span style={{ fontSize: '12px', opacity: 0.5 }}>{new Date(r.created_at).toLocaleDateString()}</span>
               </div>
               <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 12px 0', fontFamily: 'var(--font-story)' }}>{r.title}</h3>
               <p style={{ opacity: 0.8, lineHeight: '1.6', fontSize: '15px' }}>{r.content.substring(0, 150)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
