import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { searchStories } from '../services/api';

export default function Explore() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  const search = async (e) => {
    e.preventDefault();
    try {
      const data = await searchStories(q);
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: '64px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <div style={{ padding: '30px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Explore Stories</h1>
      <form onSubmit={search} style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        <input 
          value={q} onChange={e => setQ(e.target.value)} 
          placeholder="Search for a keyword or place..."
          style={{ flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid #483E31', background: 'var(--color-bg)', color: 'inherit', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '0 24px', borderRadius: '30px', background: 'var(--color-primary)', color: 'var(--color-accent)', border: 'none', cursor: 'pointer' }}>
          <Search size={20} />
        </button>
      </form>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {results.map(r => (
          <div key={r.id} style={{ background: 'rgba(50, 40, 30, 0.4)', padding: '20px', borderRadius: '12px' }}>
             <h3 style={{ margin: '0 0 12px 0' }}>{r.title}</h3>
             <div style={{display:'flex', gap: '8px'}}>
               <span style={{ fontSize: '11px', fontWeight: 'bold', background: `var(--color-${r.category})`, padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase', color: 'var(--color-bg)' }}>{r.category}</span>
               <span style={{ fontSize: '13px', background: 'rgba(50, 40, 30, 0.8)', padding: '2px 8px', borderRadius: '8px' }}>❤️ {r.reaction_count}</span>
             </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
