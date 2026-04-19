import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { createStory } from '../services/api';

export default function StoryModal({ location, session, onClose, parentId = null }) {
  const [formData, setFormData] = useState({
    title: '', content: '', category: 'memory', placeName: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=14`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            const parts = data.display_name.split(', ');
            const shortName = parts.slice(0, 3).join(', ');
            setFormData(prev => ({ ...prev, placeName: shortName || data.display_name }));
          }
        });
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    
    setLoading(true);
    try {
      await createStory({
        ...formData,
        lat: location.lat,
        lng: location.lng,
        parentId
      }, session.access_token);
      toast.success("Story successfully published!");
      onClose(true);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 12, 30, 0.4)', backdropFilter: 'blur(8px)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="parchment-card animate-fade-in" style={{
        borderRadius: '16px', width: '100%', maxWidth: '440px',
        position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', overflow: 'hidden'
      }}>
        <div style={{ height: '6px', background: 'var(--color-primary)' }} />
        
        <div style={{ padding: '32px' }}>
          <button
            onClick={() => onClose(false)}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
          >
            <X size={24} />
          </button>

          <h2 style={{ 
            fontFamily: 'var(--font-story)', fontSize: '28px', color: 'var(--color-parchment-text)',
            margin: '0 0 24px 0', fontWeight: 'bold' 
          }}>
            Drop a story
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.6 }}>
                The setting
              </label>
              <div style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--color-parchment-text)', opacity: 0.8 }}>
                {formData.placeName || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', opacity: 0.6 }}>Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)', color: 'inherit' }}
                >
                  <option value="memory">Memory</option>
                  <option value="legend">Legend</option>
                  <option value="myth">Myth</option>
                  <option value="news">News</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', opacity: 0.6 }}>Title</label>
              <input
                required
                placeholder="A name for this memory..."
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="parchment-card"
                style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '2px solid rgba(0,0,0,0.08)', outline: 'none', fontSize: '18px', fontWeight: '600' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', opacity: 0.6 }}>Content</label>
              <textarea
                required
                rows={5}
                placeholder="What once happened here?"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                className="parchment-card"
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', lineHeight: '1.6', resize: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--color-primary)', color: '#fff', border: 'none',
                padding: '16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px',
                cursor: 'pointer', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 4px 20px rgba(232, 117, 74, 0.3)'
              }}
            >
              <Send size={18} />
              {loading ? 'Publishing...' : 'Seal this story'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
