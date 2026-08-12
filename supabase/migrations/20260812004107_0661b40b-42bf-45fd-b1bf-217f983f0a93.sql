CREATE TABLE public.qualification_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar NOT NULL,
  note text NOT NULL DEFAULT '',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.qualification_sets TO authenticated;
GRANT ALL ON public.qualification_sets TO service_role;
ALTER TABLE public.qualification_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY qualification_sets_all ON public.qualification_sets
  FOR ALL TO authenticated
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (created_by = auth.uid());

CREATE TRIGGER qualification_sets_updated_at
  BEFORE UPDATE ON public.qualification_sets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.qualification_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid NOT NULL REFERENCES public.qualification_sets(id) ON DELETE CASCADE,
  label varchar NOT NULL DEFAULT '',
  file_name varchar,
  file_extension varchar,
  source_type varchar NOT NULL DEFAULT 'upload',
  raw_text text NOT NULL DEFAULT '',
  extracted jsonb NOT NULL DEFAULT '{}'::jsonb,
  extraction_source varchar NOT NULL DEFAULT 'deterministico',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX qualification_docs_set_idx ON public.qualification_docs(set_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.qualification_docs TO authenticated;
GRANT ALL ON public.qualification_docs TO service_role;
ALTER TABLE public.qualification_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY qualification_docs_all ON public.qualification_docs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.qualification_sets s WHERE s.id = qualification_docs.set_id AND (s.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.qualification_sets s WHERE s.id = qualification_docs.set_id AND s.created_by = auth.uid()));

CREATE TRIGGER qualification_docs_updated_at
  BEFORE UPDATE ON public.qualification_docs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();