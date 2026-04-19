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
      background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(12px)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div className="parchment-card animate-fade-in" style={{
        borderRadius: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh',
        position: 'relative', boxShadow: '0 30px 70px rgba(0,0,0,0.8)', overflowY: 'auto',
        background: '#F7F3EE', color: '#2A1F14'
      }}>
        <div style={{ height: '8px', background: 'var(--color-primary)' }} />
        
        <div style={{ padding: '32px 24px' }}>
          <button
            onClick={() => onClose(false)}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#2A1F14', opacity: 0.3 }}
          >
            <X size={24} />
          </button>

          <h2 style={{ 
            fontFamily: 'var(--font-story)', fontSize: '28px', color: '#2A1F14',
            margin: '0 0 24px 0', fontWeight: 'bold' 
          }}>
            Drop a story
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.5 }}>
                The setting
              </label>
              <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#2A1F14', opacity: 0.8 }}>
                {formData.placeName || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.5 }}>Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{ 
                    width: '100%', padding: '12px', borderRadius: '12px', 
                    border: '1.5px solid rgba(42,31,20,0.1)', 
                    background: '#fff', color: '#2A1F14',
                    fontSize: '15px', fontWeight: '600'
                  }}
                >
                  <option value="memory">Memory</option>
                  <option value="legend">Legend</option>
                  <option value="myth">Myth</option>
                  <option value="news">News</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.5 }}>Title</label>
              <input
                required
                placeholder="A name for this memory..."
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                style={{ 
                  width: '100%', padding: '12px 0', border: 'none', 
                  borderBottom: '2.5px solid rgba(42,31,20,0.1)', outline: 'none', 
                  fontSize: '20px', fontWeight: '700', background: 'transparent',
                  color: '#2A1F14'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.5 }}>Content</label>
              <textarea
                required
                rows={4}
                placeholder="What once happened here?"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                style={{ 
                  width: '100%', border: 'none', outline: 'none', fontSize: '17px', 
                  lineHeight: '1.6', resize: 'none', background: 'transparent',
                  color: '#2A1F14', fontFamily: 'var(--font-story)'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--color-primary)', color: '#fff', border: 'none',
                padding: '18px', borderRadius: '14px', fontWeight: '800', fontSize: '16px',
                cursor: 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 8px 24px rgba(232, 117, 74, 0.4)'
              }}
            >
              <Send size={20} />
              {loading ? 'Publishing...' : 'Seal this story'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
        </div>
      </div>
    </div>
  );
}
