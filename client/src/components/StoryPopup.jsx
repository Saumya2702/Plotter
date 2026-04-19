import React, { useState, useEffect } from 'react';
import { getStoryDetails, postReaction, postComment } from '../services/api';
import { X, Heart, MessageCircle, Share, GitBranch, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StoryPopup({ story, onClose, session, onReply }) {
  const [fullStory, setFullStory] = useState(null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStoryDetails(story.id, session?.access_token).then(data => {
      setFullStory(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [story.id, session]);

  const handleReact = async (type) => {
    if (!session) return toast.error("Please sign in to react");
    const hasTypeKey = `user_has_${type}`;
    const typeKey = `${type}_count`;

    setFullStory(prev => {
      if (!prev) return prev;
      const willAdd = !prev.story[hasTypeKey];
      return {
        ...prev,
        story: {
          ...prev.story,
          [typeKey]: Math.max(0, parseInt(prev.story[typeKey] || 0) + (willAdd ? 1 : -1)),
          [hasTypeKey]: willAdd
        }
      }
    });

    try {
      await postReaction(story.id, type, session.access_token);
    } catch (err) {
      toast.error("Failed to react");
    }
  };

  const s = fullStory ? fullStory.story : story;

  return (
    <div className="animate-fade-in" style={{
      position: 'absolute', top: '90px', left: '30px', zIndex: 1100,
      width: '320px', maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto', borderRadius: '20px', overflowX: 'hidden',
      boxShadow: '0 30px 60px rgba(0,0,0,0.4)', pointerEvents: 'auto',
      background: 'var(--color-card-bg)', color: 'var(--color-text)',
      border: '1px solid var(--color-border)', backdropFilter: 'blur(8px)'
    }}>
      <div style={{ padding: '0', position: 'relative' }}>
        {/* Category Strip */}
        <div style={{ 
          height: '6px', 
          background: `var(--color-${s.category})`,
          boxShadow: `0 0 10px var(--color-${s.category})`
        }} />
        
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ 
              fontSize: '11px', fontWeight: '800', letterSpacing: '1px', 
              textTransform: 'uppercase', color: `var(--color-${s.category})` 
            }}>
              {s.category}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text)', opacity: 0.5, cursor: 'pointer', padding: 0 }}>
              <X size={20} />
            </button>
          </div>

          <h3 style={{ 
            fontFamily: 'var(--font-story)', fontSize: '24px', marginBottom: '16px', lineHeight: '1.2',
            fontWeight: '700'
          }}>
            {s.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <img 
              src={s.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${s.username}`} 
              style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--color-border)' }} alt="" 
            />
            <span style={{ fontSize: '13px', opacity: 0.6 }}>
              by <strong>{s.username || 'Anonymous'}</strong>
            </span>
          </div>

          <div style={{ 
            fontFamily: 'var(--font-story)', marginBottom: '20px', fontSize: '16px', lineHeight: '1.6', opacity: 0.9 
          }}>
            {s.content}
          </div>

          {s.image_url && (
            <img src={s.image_url} alt="" style={{ width: 'calc(100% + 48px)', margin: '0 -24px 20px', display: 'block' }} />
          )}

          <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <button onClick={() => handleReact('like')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}>
              <Heart size={18} fill={s.user_has_like ? "#E53E3E" : "transparent"} color={s.user_has_like ? "#E53E3E" : "currentColor"} />
              <span style={{ fontSize: '14px', fontWeight: '700' }}>{s.like_count || 0}</span>
            </button>

            <button onClick={() => { setCommentsOpen(!commentsOpen); setThreadOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}>
              <MessageCircle size={18} color="currentColor" />
              <span style={{ fontSize: '14px', fontWeight: '700' }}>{fullStory?.comments?.length || 0}</span>
            </button>

            <button onClick={() => { setThreadOpen(!threadOpen); setCommentsOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}>
              <GitBranch size={18} color="currentColor" />
              <span style={{ fontSize: '14px', fontWeight: '700' }}>{fullStory?.thread?.length || 0}</span>
            </button>

            <button onClick={() => {
              navigator.clipboard.writeText(window.location.origin + '/?story=' + s.id);
              toast.success("Link copied!");
            }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', opacity: 0.5 }}>
              <Share size={18} />
            </button>
          </div>
        </div>

        {/* Continuations / Threads */}
        {threadOpen && (
          <div className="animate-fade-in" style={{ padding: '0 24px 24px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--color-border)' }}>
             <h4 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.4, margin: '16px 0 12px 0' }}>Continuations</h4>
             {loading ? (
               <div style={{ fontSize: '12px', opacity: 0.5 }}>Loading tales...</div>
             ) : (
               <>
                 {fullStory?.thread?.map(t => (
                   <div key={t.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                     <div style={{ width: '2px', background: 'var(--color-primary)', opacity: 0.3, borderRadius: '2px' }} />
                     <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{t.title}</div>
                        <div style={{ fontSize: '12px', opacity: 0.5 }}>by {t.username}</div>
                     </div>
                   </div>
                 ))}
                 {fullStory?.thread?.length === 0 && <div style={{ fontSize: '13px', opacity: 0.5, fontStyle: 'italic', marginBottom: '12px' }}>This tale has no branches yet.</div>}
                 <button 
                   onClick={onReply}
                   style={{ 
                     width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px dashed var(--color-border)',
                     background: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '13px', fontWeight: '800',
                     display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
                   }}
                   onMouseOver={e => e.currentTarget.style.background = 'rgba(232,117,74,0.05)'}
                   onMouseOut={e => e.currentTarget.style.background = 'none'}
                 >
                   <Plus size={16} /> Continue this tale
                 </button>
               </>
             )}
          </div>
        )}

        {/* Comments Section */}
        {commentsOpen && (
          <div className="animate-fade-in" style={{ background: 'rgba(0,0,0,0.02)', padding: '24px', borderTop: '1px solid var(--color-border)' }}>
            <h4 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 16px 0' }}>Reflections</h4>
            {loading ? (
              <div style={{ fontSize: '12px', opacity: 0.5 }}>Gathering whispers...</div>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {fullStory?.comments?.map(c => (
                  <div key={c.id} style={{ marginBottom: '16px', fontSize: '14px' }}>
                    <div style={{ fontWeight: '800', marginBottom: '2px', fontSize: '12px' }}>{c.username}</div>
                    <div style={{ opacity: 0.8 }}>{c.content}</div>
                  </div>
                ))}
                {fullStory?.comments?.length === 0 && <div style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '13px' }}>No reflections yet.</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
