-- entries
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_spent_minutes INTEGER NOT NULL CHECK (time_spent_minutes > 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entries_owner" ON entries FOR ALL USING (auth.uid() = user_id);

-- tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_owner" ON tags FOR ALL USING (auth.uid() = user_id);

-- entry_tags (junction)
CREATE TABLE entry_tags (
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id)
);
ALTER TABLE entry_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entry_tags_owner" ON entry_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM entries WHERE id = entry_id AND user_id = auth.uid())
  );

-- ai_summaries
CREATE TABLE ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  prompt_hash TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, prompt_hash)
);
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_summaries_owner" ON ai_summaries FOR ALL USING (auth.uid() = user_id);
