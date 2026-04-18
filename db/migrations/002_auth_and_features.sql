CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, username, avatar_url)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DO $$ BEGIN
    CREATE TYPE story_category AS ENUM ('memory', 'legend', 'myth', 'news');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DROP TABLE IF EXISTS replies CASCADE;
DROP TABLE IF EXISTS stories CASCADE;

CREATE TABLE stories (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  parent_id  INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  category   story_category NOT NULL DEFAULT 'memory',
  title      VARCHAR(200) NOT NULL,
  content    TEXT NOT NULL,
  location   GEOGRAPHY(Point, 4326) NOT NULL,
  place_name TEXT,
  image_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stories_location_gist ON stories USING GIST (location::geometry);
CREATE INDEX idx_stories_created_at ON stories (created_at DESC);
CREATE INDEX idx_stories_parent_id ON stories (parent_id);

ALTER TABLE stories ADD COLUMN text_search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED;

CREATE INDEX idx_stories_search ON stories USING GIN(text_search_vector);

CREATE TABLE reactions (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  story_id   INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL, -- 'like', 'haunt', 'legend'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, story_id, type)
);

CREATE INDEX idx_reactions_story ON reactions(story_id);
