-- Migration: Add support for nested comment threads
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES public.comments(id) ON DELETE CASCADE;

-- Index for performance on parent_id lookups
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
