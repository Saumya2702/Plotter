import React, { useState, useEffect } from 'react';
import { getStoryDetails, postReaction, postComment } from '../services/api';
import { X, Heart, MessageCircle, Share, GitBranch } from 'lucide-react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function StoryPopup({ story, onClose, session, onReply }) {
  const [fullStory, setFullStory] = useState(null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isDeployingComment, setIsDeployingComment] = useState(false);

  useEffect(() => {
    // Fetch full thread data when popup opens
    getStoryDetails(story.id, session?.access_token).then(data => {
      setFullStory(data);
    });
  }, [story.id, session]);

  const handleReact = async (type) => {
    if (!session) return toast.error("Please sign in to react");

    // Optimistic UI Update
    const typeKey = `${type}_count`;
    const hasTypeKey = `user_has_${type}`;

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
      console.error(err);
      // Rollback on failure
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
      toast.error(err.response?.data?.error || "Failed to process reaction");
    }
  };

  const handlePostComment = async () => {
    if (!session) return toast.error("Please sign in to comment");
    if (!commentInput.trim()) return;

    setIsDeployingComment(true);
    try {
      const newComment = await postComment(story.id, commentInput, session.access_token);

      setFullStory(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...(prev.comments || []), {
            ...newComment,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url
          }]
        };
      });
      setCommentInput('');
      toast.success("Comment posted!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to post comment");
    } finally {
      setIsDeployingComment(false);
    }
  };

  const s = fullStory ? fullStory.story : story;

  const contentNode = (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              background: `var(--color-${s.category})`, color: '#fff',
              fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase'
            }}>{s.category}</span>
            <span style={{ fontSize: '12px', color: '#666' }}>
              {new Date(s.created_at).toLocaleDateString()}
            </span>
          </div>
          <h3 style={{ margin: '4px 0', fontSize: '20px', fontWeight: '600' }}>{s.title}</h3>
          <div style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img src={s.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=' + s.username} width={16} height={16} style={{ borderRadius: '50%' }} alt="" />
            {s.username || 'Anonymous'} {s.place_name && `• ${s.place_name}`}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#999' }}><X size={20} /></button>
      </div>

      <div className="story-body-text" style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {s.content}
      </div>

      {s.image_url && <img src={s.image_url} alt="" style={{ width: '100%', borderRadius: '8px', marginTop: '12px', maxHeight: '140px', objectFit: 'cover' }} />}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
        <button onClick={() => handleReact('like')} style={{ display: 'flex', alignItems: 'center', gap: '4px', border: s.user_has_like ? '1px solid #e53e3e' : '1px solid transparent', background: s.user_has_like ? '#fef2f2' : '#f5f5f5', padding: '5px 11px', borderRadius: '16px', cursor: 'pointer', fontSize: '13px', color: s.user_has_like ? '#e53e3e' : 'inherit' }}>
          <Heart size={14} color="#e53e3e" fill={s.user_has_like ? "#e53e3e" : "transparent"} /> {s.like_count || 0}
        </button>

        <button onClick={() => { setCommentsOpen(!commentsOpen); setThreadOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: commentsOpen ? '#ebf8ff' : '#f5f5f5', color: commentsOpen ? '#3182ce' : 'inherit', padding: '5px 11px', borderRadius: '16px', cursor: 'pointer', fontSize: '13px' }}>
          <MessageCircle size={14} color="#4299e1" /> {fullStory?.comments?.length || 0}
        </button>

        <button onClick={() => { setThreadOpen(!threadOpen); setCommentsOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: threadOpen ? '#f0fff4' : '#f5f5f5', color: threadOpen ? '#38a169' : 'inherit', padding: '5px 11px', borderRadius: '16px', cursor: 'pointer', fontSize: '13px' }}>
          <GitBranch size={14} color="#48bb78" /> {fullStory?.thread?.length || 0}
        </button>

        <button onClick={() => {
          navigator.clipboard.writeText(window.location.origin + '/?story=' + s.id);
          toast.success("Link copied!");
        }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: '#f5f5f5', padding: '5px 11px', borderRadius: '16px', cursor: 'pointer', fontSize: '13px' }}
        >
          <Share size={14} color="#48bb78" /> Share
        </button>
      </div>

      {threadOpen && fullStory && (
        <div style={{ marginTop: '20px', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#666' }}>Continuations</h4>

          {fullStory.thread?.length > 0 ? (
            fullStory.thread.map(t => (
              <div key={t.id} style={{ marginBottom: '12px', borderLeft: '2px solid #ddd', paddingLeft: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <img src={t.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=' + t.username} width={14} height={14} style={{ borderRadius: '50%' }} alt="" />
                  {t.username || 'Anonymous'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'inherit' }}>{t.title}</div>
                <div className="story-body-text" style={{ fontSize: '13px', marginTop: '2px' }}>{t.content}</div>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>No continuations yet.</div>
          )}

          <button
            onClick={onReply}
            style={{ width: '100%', padding: '8px', background: 'var(--color-primary)', color: 'var(--color-accent)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
          >
            <GitBranch size={16} /> Continue this story...
          </button>
        </div>
      )}

      {commentsOpen && fullStory && (
        <div style={{ marginTop: '20px', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#666' }}>Comments</h4>

          <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '12px' }}>
            {fullStory.comments?.length > 0 ? (
              fullStory.comments.map(c => (
                <div key={c.id} style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <img src={c.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=' + c.username} width={14} height={14} style={{ borderRadius: '50%' }} alt="" />
                    {c.username || 'Anonymous'}
                    <button
                      onClick={() => setCommentInput(`@${c.username || 'Anonymous'} `)}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '11px', color: '#3182ce', cursor: 'pointer', padding: 0 }}
                    >
                      Reply
                    </button>
                  </div>
                  <div className="story-body-text" style={{ fontSize: '13px' }}>{c.content}</div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: '#888' }}>No comments yet.</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              placeholder="Write a comment..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid #ccc', fontSize: '13px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePostComment(); }}
            />
            <button
              onClick={handlePostComment}
              disabled={isDeployingComment}
              style={{ background: '#3182ce', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const isMobile = window.innerWidth <= 768;

  return (
    <>
      <div className={`bottom-sheet ${isMobile ? 'open' : ''} story-popup-mobile`}>
        {contentNode}
      </div>

      {!isMobile && (
        <div
          className="story-popup-desktop"
          style={{
            position: 'absolute', top: '80px', left: '20px', zIndex: 1000,
            background: 'var(--color-accent)', color: 'var(--color-bg)', borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', width: '360px',
            maxHeight: 'calc(100vh - 100px)', overflowY: 'auto',
            pointerEvents: 'auto'
          }}
        >
          {contentNode}
        </div>
      )}
    </>
  );
}
