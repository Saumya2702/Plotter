-- Create notifications table for in-app interaction alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Recipient
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Who triggered it
  type TEXT NOT NULL, -- 'comment', 'reply', 'thread'
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  content TEXT, -- Preview of the comment or title
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
