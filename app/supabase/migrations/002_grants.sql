-- Grant table-level privileges to Supabase roles.
-- Tables created via SQL migration (rather than the Supabase dashboard) do not
-- automatically receive these grants, which are required alongside RLS policies.
-- Without them, even a valid JWT cannot read or write any rows.

-- authenticated: users who have signed in — can CRUD their own rows (enforced by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.entries       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tags          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.entry_tags    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ai_summaries  TO authenticated;

-- service_role: Supabase internal role, bypasses RLS
GRANT ALL ON TABLE public.entries       TO service_role;
GRANT ALL ON TABLE public.tags          TO service_role;
GRANT ALL ON TABLE public.entry_tags    TO service_role;
GRANT ALL ON TABLE public.ai_summaries  TO service_role;

-- anon: unauthenticated visitors — no access to any application table
REVOKE ALL ON TABLE public.entries       FROM anon;
REVOKE ALL ON TABLE public.tags          FROM anon;
REVOKE ALL ON TABLE public.entry_tags    FROM anon;
REVOKE ALL ON TABLE public.ai_summaries  FROM anon;

-- Make INSERT policies explicit with WITH CHECK so the intent is unambiguous.
-- The original FOR ALL USING (...) policies implied WITH CHECK = USING, which is
-- correct but easy to misread. Dropping and recreating them with both clauses.

DROP POLICY IF EXISTS "entries_owner"    ON public.entries;
DROP POLICY IF EXISTS "tags_owner"       ON public.tags;
DROP POLICY IF EXISTS "entry_tags_owner" ON public.entry_tags;
DROP POLICY IF EXISTS "ai_summaries_owner" ON public.ai_summaries;

CREATE POLICY "entries_owner" ON public.entries
  FOR ALL
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tags_owner" ON public.tags
  FOR ALL
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "entry_tags_owner" ON public.entry_tags
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.entries WHERE id = entry_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.entries WHERE id = entry_id AND user_id = auth.uid())
  );

CREATE POLICY "ai_summaries_owner" ON public.ai_summaries
  FOR ALL
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
