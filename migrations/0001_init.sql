CREATE TABLE collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  picks TEXT NOT NULL,          -- JSON: [{ stop, artworkId, note?, photoId?, r }]
  on_wall INTEGER NOT NULL DEFAULT 1,
  hidden INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_collections_created ON collections (created_at DESC);

CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  mime TEXT NOT NULL,
  data TEXT NOT NULL,           -- base64 JPEG, compressed on the phone
  created_at INTEGER NOT NULL
);
