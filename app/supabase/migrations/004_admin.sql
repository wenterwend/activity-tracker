-- ── profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  is_admin      BOOLEAN     NOT NULL DEFAULT false,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  last_active_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self_read"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
REVOKE ALL ON profiles FROM anon;

-- Backfill a profile row for every existing auth user
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── system_messages ───────────────────────────────────────────────────────────
CREATE TABLE system_messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  message    TEXT        NOT NULL,
  created_by UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active  BOOLEAN     NOT NULL DEFAULT true
);

ALTER TABLE system_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "system_messages_authenticated_read" ON system_messages
  FOR SELECT USING (auth.role() = 'authenticated');
GRANT SELECT ON system_messages TO authenticated;
GRANT ALL ON system_messages TO service_role;
REVOKE ALL ON system_messages FROM anon;

-- ── audit_log ─────────────────────────────────────────────────────────────────
CREATE TABLE audit_log (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  action     TEXT        NOT NULL,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
-- Only service_role can write; no authenticated access
GRANT ALL ON audit_log TO service_role;
REVOKE ALL ON audit_log FROM anon;
REVOKE ALL ON audit_log FROM authenticated;

-- Ensure service_role has access to all tables (safe to run multiple times)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ── ai_summaries: add token columns ──────────────────────────────────────────
ALTER TABLE ai_summaries ADD COLUMN IF NOT EXISTS input_tokens  INTEGER;
ALTER TABLE ai_summaries ADD COLUMN IF NOT EXISTS output_tokens INTEGER;

-- ── Helper functions for admin orphaned-tag queries ───────────────────────────
CREATE OR REPLACE FUNCTION get_orphaned_personal_tags()
RETURNS TABLE (id UUID, name TEXT, owner_email TEXT)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT t.id, t.name, p.email
  FROM tags t
  LEFT JOIN profiles p ON p.id = t.user_id
  WHERE NOT EXISTS (SELECT 1 FROM entry_tags et WHERE et.tag_id = t.id)
  ORDER BY t.name;
$$;

CREATE OR REPLACE FUNCTION get_orphaned_shared_tags()
RETURNS TABLE (id UUID, name TEXT, creator_email TEXT)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT st.id, st.name, p.email
  FROM shared_tags st
  LEFT JOIN profiles p ON p.id = st.created_by
  WHERE NOT EXISTS (SELECT 1 FROM entry_shared_tags est WHERE est.shared_tag_id = st.id)
  ORDER BY st.name;
$$;

GRANT EXECUTE ON FUNCTION get_orphaned_personal_tags() TO service_role;
GRANT EXECUTE ON FUNCTION get_orphaned_shared_tags()  TO service_role;
