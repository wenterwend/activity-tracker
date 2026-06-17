-- Shared tags visible to all authenticated users, not owned by any single user
CREATE TABLE shared_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE shared_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shared_tags_read" ON shared_tags
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "shared_tags_insert" ON shared_tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only the creator can delete their shared tag
CREATE POLICY "shared_tags_delete" ON shared_tags
  FOR DELETE USING (auth.uid() = created_by);

GRANT SELECT, INSERT, DELETE ON shared_tags TO authenticated;
GRANT ALL ON shared_tags TO service_role;

-- Separate junction table for shared tag ↔ entry relationships.
-- Keeping this distinct from entry_tags avoids making tag_id nullable.
CREATE TABLE entry_shared_tags (
  entry_id     UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  shared_tag_id UUID NOT NULL REFERENCES shared_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, shared_tag_id)
);

ALTER TABLE entry_shared_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entry_shared_tags_owner" ON entry_shared_tags
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM entries WHERE id = entry_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM entries WHERE id = entry_id AND user_id = auth.uid())
  );

GRANT SELECT, INSERT, DELETE ON entry_shared_tags TO authenticated;
GRANT ALL ON entry_shared_tags TO service_role;
