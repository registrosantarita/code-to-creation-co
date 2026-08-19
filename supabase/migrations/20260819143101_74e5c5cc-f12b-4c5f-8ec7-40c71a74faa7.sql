ALTER TABLE public.qualification_docs ADD COLUMN IF NOT EXISTS doc_species text NOT NULL DEFAULT 'nao_classificado';

CREATE TABLE public.qualification_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid NOT NULL REFERENCES public.qualification_sets(id) ON DELETE CASCADE,
  title character varying NOT NULL DEFAULT '',
  paradigm_doc_id uuid REFERENCES public.qualification_docs(id) ON DELETE SET NULL,
  compared_doc_ids uuid[] NOT NULL DEFAULT '{}',
  criteria text[] NOT NULL DEFAULT '{}',
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text NOT NULL DEFAULT '',
  classification text NOT NULL DEFAULT 'inconclusive',
  validations jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.qualification_comparisons TO authenticated;
GRANT ALL ON public.qualification_comparisons TO service_role;

ALTER TABLE public.qualification_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dono do conjunto ou admin gerencia comparacoes"
ON public.qualification_comparisons
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.qualification_sets s
    WHERE s.id = qualification_comparisons.set_id
      AND (s.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.qualification_sets s
    WHERE s.id = qualification_comparisons.set_id
      AND (s.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE INDEX idx_qualification_comparisons_set ON public.qualification_comparisons(set_id);

CREATE TRIGGER qualification_comparisons_updated_at
BEFORE UPDATE ON public.qualification_comparisons
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();