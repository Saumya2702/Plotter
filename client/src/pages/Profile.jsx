import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { getUserProfile, updateUserProfile } from '../services/api';
import { User, Heart, Map as MapIcon, Edit2, Check, X as CloseIcon } from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', avatar_url: '' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserData(session?.user);
    });
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile(id);
      setProfile(data);
    } catch (err) {
      toast.error("Profile not found");
    }
  };

  const handleEditInit = () => {
    setEditForm({ username: profile.username || '', avatar_url: profile.avatar_url || '' });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await updateUserProfile(id, editForm, session.access_token);
      toast.success("Profile updated!");
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    }
  };

  if (!profile) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0C1E' }}>
      <div className="animate-pulse" style={{ color: 'var(--color-primary)' }}>Loading...</div>
    </div>
  );

  const isOwnProfile = currentUserData && currentUserData.id === profile.id;

  return (
    <div style={{ marginTop: '72px', minHeight: 'calc(100vh - 72px)', background: '#0F0C1E', color: '#fff' }}>
      <div style={{ padding: '60px 32px', maxWidth: '900px', margin: '0 auto' }} className="animate-fade-in">
        
        {/* Profile Header Block */}
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', marginBottom: '60px', position: 'relative' }}>
          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', mdDirection: 'row', alignItems: 'center', textAlign: 'center', mdTextAlign: 'left', gap: '32px' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={profile.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.username}`} 
                  width={120} height={120} 
                  style={{ borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--color-primary)', boxShadow: '0 0 20px rgba(232, 117, 74, 0.3)' }} 
                  alt=""
                />
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', letterSpacing: '-1px' }}>{profile.username || 'Anonymous'}</h1>
                <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'center', mdJustifyContent: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7 }}>
                    <MapIcon size={16} color="var(--color-primary)" />
                    <span style={{ fontSize: '15px' }}>{profile.stats.total_pins} Stories</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7 }}>
                    <Heart size={16} color="#F687B3" />
                    <span style={{ fontSize: '15px' }}>{profile.stats.total_reactions_received} Reactions</span>
                  </div>
                </div>
              </div>
              {isOwnProfile && (
                <button 
                  onClick={handleEditInit} 
                  style={{ 
                    position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', 
                    color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '12px', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' 
                  }}
                >
                  <Edit2 size={14} /> Edit
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave} className="animate-fade-in">
              <h2 style={{ margin: '0 0 24px 0', fontSize: '24px' }}>Refine your identity</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.5 }}>Username</label>
                  <input 
                    required value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.5 }}>Avatar URL</label>
                  <input 
                    value={editForm.avatar_url} onChange={e => setEditForm({...editForm, avatar_url: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <button type="submit" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Check size={16} /> Save Changes
                 </button>
                 <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <CloseIcon size={16} /> Cancel
                 </button>
              </div>
            </form>
          )}
        </div>

        {/* Stories Section */}
        <h2 style={{ fontFamily: 'var(--font-story)', fontSize: '28px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          Your Chronicled Journeys
          <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }} />
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          {profile.stories.map(s => (
            <div key={s.id} className="glass-panel" style={{ padding: '24px 32px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `var(--color-${s.category})`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                    <MapIcon size={20} color="#fff" />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: `var(--color-${s.category})`, marginBottom: '4px', display: 'block' }}>{s.category}</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0, fontFamily: 'var(--font-story)' }}>{s.title}</h3>
                  </div>
               </div>
               <div style={{ opacity: 0.6, fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Heart size={16} fill="var(--color-news)" color="var(--color-news)" />
                 {s.reaction_count}
               </div>
            </div>
          ))}
          {profile.stories.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', opacity: 0.4, fontStyle: 'italic' }}>
              No stories told yet...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
