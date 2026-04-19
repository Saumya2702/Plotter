import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
    setLoading(true);
    try {
      await createStory({
        ...formData,
        lat: location.lat,
        lng: location.lng,
        parentId
      }, session.access_token);
      toast.success("Story successfully published!");
      onClose(true); // Signal success
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--color-accent)', borderRadius: '16px', width: '100%', maxWidth: '500px',
        padding: '24px', position: 'relative', color: 'var(--color-bg)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        <button
          onClick={() => onClose(false)}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-bg)', opacity: 0.6 }}
        >
          <X size={24} />
        </button>

        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px' }}>Draft a Story</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', opacity: 0.7 }}>Location</label>
            <input
              readOnly
              value={formData.placeName || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #483E31', background: 'rgba(0,0,0,0.05)', color: 'inherit', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', opacity: 0.7 }}>Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #483E31', background: 'var(--color-accent)', color: 'inherit' }}
            >
              <option value="memory">Memory</option>
              <option value="legend">Legend</option>
              <option value="myth">Myth</option>
              <option value="news">News</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', opacity: 0.7 }}>Title</label>
            <input
              required
              placeholder="Give your story a title..."
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #483E31', background: 'var(--color-accent)', color: 'inherit', fontSize: '16px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', opacity: 0.7 }}>Story</label>
            <textarea
              required
              rows={5}
              placeholder="What happened here?"
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #483E31', background: 'var(--color-accent)', color: 'inherit', fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--color-primary)', color: 'var(--color-accent)', border: 'none',
              padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px',
              cursor: 'pointer', marginTop: '8px', transition: 'all 0.2s'
            }}
          >
            {loading ? 'Publishing...' : 'Publish to map'}
          </button>
        </form>
      </div>
    </div>
  );
}
