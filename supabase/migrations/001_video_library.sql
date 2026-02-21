-- ============================================
-- VIDEO LIBRARY — Tables & Policies
-- ============================================

-- 1. Videos Table
-- Each video has a "segment_category" that labels it as
-- 'beginning', 'middle', or 'end' for sequencing purposes.
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,                         -- video source URL (Supabase Storage, external, etc.)
  thumbnail_url TEXT,                        -- optional thumbnail
  segment_category TEXT NOT NULL DEFAULT 'middle'
    CHECK (segment_category IN ('beginning', 'middle', 'end')),
  duration_seconds INTEGER,                  -- optional: video length
  tags TEXT[] DEFAULT '{}',                  -- freeform tags for filtering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their videos"
  ON videos FOR ALL USING (auth.uid() = user_id);

-- 2. Video Sequences Table
-- A named playlist / sequence that strings videos together.
-- Every sequence MUST have a beginning clip and an ending clip.
CREATE TABLE video_sequences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE video_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their sequences"
  ON video_sequences FOR ALL USING (auth.uid() = user_id);

-- 3. Sequence Items (join table with ordering)
-- Links videos ↔ sequences and keeps an explicit sort_order.
CREATE TABLE sequence_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID REFERENCES video_sequences(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,     -- 0-based position in the sequence
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(sequence_id, sort_order)            -- no duplicate positions
);

ALTER TABLE sequence_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their sequence items"
  ON sequence_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM video_sequences
      WHERE video_sequences.id = sequence_items.sequence_id
        AND video_sequences.user_id = auth.uid()
    )
  );

-- Index for fast ordering queries
CREATE INDEX idx_sequence_items_order
  ON sequence_items (sequence_id, sort_order);
