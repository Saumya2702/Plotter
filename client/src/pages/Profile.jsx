import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { getUserProfile, updateUserProfile } from '../services/api';

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

  if (!profile) return <div style={{paddingTop: '80px', textAlign: 'center'}}>Loading...</div>;

  const isOwnProfile = currentUserData && currentUserData.id === profile.id;

  return (
    <div style={{ marginTop: '64px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <div style={{ padding: '30px 20px', maxWidth: '800px', margin: '0 auto' }}>
      
      {!isEditing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '50px' }}>
          <img src={profile.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed='+profile.username} width={90} height={90} style={{borderRadius: '50%', objectFit: 'cover'}} alt=""/>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '32px' }}>{profile.username || 'Anonymous'}</h1>
            <p style={{ margin: '8px 0 0 0', color: '#aaa', fontSize: '16px' }}>
              {profile.stats.total_pins} stories written • {profile.stats.total_reactions_received} reactions received
            </p>
          </div>
          {isOwnProfile && (
            <button onClick={handleEditInit} style={{ background: '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>
              Edit Profile
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSave} style={{ background: 'rgba(50, 40, 30, 0.4)', padding: '24px', borderRadius: '12px', marginBottom: '50px' }}>
          <h2 style={{marginTop: 0}}>Edit Profile</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Username</label>
            <input 
              required value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #483E31', background: 'var(--color-bg)', color: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Avatar Image URL (Optional)</label>
            <input 
              value={editForm.avatar_url} onChange={e => setEditForm({...editForm, avatar_url: e.target.value})}
              placeholder="https://example.com/my-avatar.jpg"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #483E31', background: 'var(--color-bg)', color: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
             <button type="submit" style={{ background: 'var(--color-primary)', color: 'var(--color-accent)', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
             <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid #555', color: 'inherit', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      <h2 style={{borderBottom: '1px solid #333', paddingBottom: '12px', marginBottom: '20px'}}>Top Stories</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {profile.stories.map(s => (
          <div key={s.id} style={{ background: 'rgba(50, 40, 30, 0.4)', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{display:'flex', alignItems: 'center', gap: '16px'}}>
                <span style={{ fontSize: '10px', background: `var(--color-${s.category})`, padding: '3px 8px', borderRadius: '12px', textTransform:'uppercase' }}>{s.category}</span>
                <span style={{ fontSize: '18px', fontWeight: 500 }}>{s.title}</span>
             </div>
             <div style={{ color: '#aaa', fontSize: '14px' }}>❤️ {s.reaction_count}</div>
          </div>
        ))}
        {profile.stories.length === 0 && <div style={{color: '#888'}}>No stories yet.</div>}
      </div>
      </div>
    </div>
  );
}
