
CREATE EXTENSION IF NOT EXISTS postgis;


CREATE TABLE IF NOT EXISTS stories (
  id         SERIAL        PRIMARY KEY,
  title      VARCHAR(200)  NOT NULL,
  content    TEXT          NOT NULL,
  location   GEOGRAPHY(Point, 4326) NOT NULL,
  image_url  TEXT,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_stories_location_gist
  ON stories
  USING GIST (location::geometry);

CREATE INDEX IF NOT EXISTS idx_stories_created_at
  ON stories (created_at DESC);


CREATE TABLE IF NOT EXISTS replies (
  id         SERIAL       PRIMARY KEY,
  story_id   INTEGER      NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  content    TEXT         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_replies_story_id
  ON replies (story_id);

