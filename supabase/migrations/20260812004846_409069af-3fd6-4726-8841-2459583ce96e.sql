ALTER TABLE public.qualification_docs
  ADD COLUMN IF NOT EXISTS doc_role text NOT NULL DEFAULT 'titulo';

ALTER TABLE public.qualification_docs
  DROP CONSTRAINT IF EXISTS qualification_docs_doc_role_check;
ALTER TABLE public.qualification_docs
  ADD CONSTRAINT qualification_docs_doc_role_check CHECK (doc_role IN ('titulo','matricula'));

ALTER TABLE public.qualification_sets
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'titulo_x_matricula';

ALTER TABLE public.qualification_sets
  DROP CONSTRAINT IF EXISTS qualification_sets_mode_check;
ALTER TABLE public.qualification_sets
  ADD CONSTRAINT qualification_sets_mode_check CHECK (mode IN ('titulo_x_matricula','titulo_x_titulo'));