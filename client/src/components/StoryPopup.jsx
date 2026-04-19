import React, { useState, useEffect } from 'react';
import { getStoryDetails, postReaction, postComment } from '../services/api';
import { X, Heart, MessageCircle, Share, GitBranch } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StoryPopup({ story, onClose, session, onReply }) {
  const [fullStory, setFullStory] = useState(null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isDeployingComment, setIsDeployingComment] = useState(false);

  useEffect(() => {
    getStoryDetails(story.id, session?.access_token).then(data => {
      setFullStory(data);
    });
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
      overflowY: 'auto', borderRadius: '12px', overflowX: 'hidden',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)', pointerEvents: 'auto'
    }}>
      <div className="parchment-card" style={{ padding: '0', position: 'relative' }}>
        {/* Header Image or Category Strip */}
        <div style={{ 
          height: '6px', 
          background: `var(--color-${s.category})`,
          boxShadow: `0 0 10px var(--color-${s.category})`
        }} />
        
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <span style={{ 
              fontSize: '11px', fontWeight: '800', letterSpacing: '1px', 
              textTransform: 'uppercase', color: `var(--color-${s.category})` 
            }}>
              {s.category}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 0 }}>
              <X size={18} />
            </button>
          </div>

          <h3 className="story-title" style={{ fontSize: '22px', marginBottom: '12px', lineHeight: '1.2' }}>
            {s.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <img 
              src={s.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${s.username}`} 
              style={{ width: '20px', height: '20px', borderRadius: '50%' }} alt="" 
            />
            <span style={{ fontSize: '12px', opacity: 0.7, fontStyle: 'italic' }}>
              by {s.username || 'Anonymous'}
            </span>
          </div>

          <div className="story-body" style={{ marginBottom: '20px' }}>
            {s.content}
          </div>

          {s.image_url && (
            <img src={s.image_url} alt="" style={{ width: 'calc(100% + 48px)', margin: '0 -24px 20px', display: 'block' }} />
          )}

          <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
            <button onClick={() => handleReact('like')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Heart size={16} fill={s.user_has_like ? "#E53E3E" : "transparent"} color={s.user_has_like ? "#E53E3E" : "#555"} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{s.like_count || 0}</span>
            </button>

            <button onClick={() => setCommentsOpen(!commentsOpen)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <MessageCircle size={16} color="#555" />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{fullStory?.comments?.length || 0}</span>
            </button>

            <button onClick={() => setThreadOpen(!threadOpen)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <GitBranch size={16} color="#555" />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{fullStory?.thread?.length || 0}</span>
            </button>

            <button onClick={() => {
              navigator.clipboard.writeText(window.location.origin + '/?story=' + s.id);
              toast.success("Link copied!");
            }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
              <Share size={16} />
            </button>
          </div>
        </div>

        {/* Continuations / Threads */}
        {threadOpen && fullStory && (
          <div className="animate-fade-in" style={{ padding: '0 24px 24px', background: 'rgba(0,0,0,0.01)' }}>
             <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 12px 0' }}>Continuations</h4>
             {fullStory.thread?.map(t => (
               <div key={t.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px', opacity: 0.8 }}>
                 <div style={{ width: '2px', background: 'var(--color-border)', borderRadius: '2px' }} />
                 <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-parchment-text)' }}>{t.title}</div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>by {t.username}</div>
                 </div>
               </div>
             ))}
             <button 
               onClick={onReply}
               style={{ 
                 width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px dashed var(--color-border)',
                 background: 'none', cursor: 'pointer', color: 'var(--color-parchment-text)', fontSize: '13px', fontWeight: '700',
                 marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
               }}
             >
               <Plus size={14} /> Continue this tale
             </button>
          </div>
        )}

        {/* Comments Section */}
        {commentsOpen && fullStory && (
          <div style={{ background: 'rgba(0,0,0,0.03)', padding: '24px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 16px 0' }}>Reflections</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
              {fullStory.comments?.map(c => (
                <div key={c.id} style={{ marginBottom: '16px', fontSize: '13px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '2px' }}>{c.username}</div>
                  <div style={{ opacity: 0.8 }}>{c.content}</div>
                </div>
              ))}
              {fullStory.comments?.length === 0 && <div style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '13px' }}>No reflections yet.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
