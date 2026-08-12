CREATE TABLE public.index_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar NOT NULL,
  note text NOT NULL DEFAULT '',
  export_layout varchar NOT NULL DEFAULT 'csv_padrao',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.index_batches TO authenticated;
GRANT ALL ON public.index_batches TO service_role;
ALTER TABLE public.index_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY index_batches_all ON public.index_batches FOR ALL TO authenticated
  USING ((created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (created_by = auth.uid());

CREATE TABLE public.index_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.index_batches(id) ON DELETE CASCADE,
  label varchar NOT NULL DEFAULT '',
  file_name varchar,
  file_extension varchar,
  source_type varchar NOT NULL DEFAULT 'upload',
  matricula_numero varchar,
  livro varchar,
  folha varchar,
  cartorio varchar,
  data_abertura date,
  natureza varchar NOT NULL DEFAULT 'nao_identificado',
  descricao text NOT NULL DEFAULT '',
  endereco text NOT NULL DEFAULT '',
  municipio varchar,
  uf varchar,
  area_m2 numeric,
  cadastros jsonb NOT NULL DEFAULT '{}'::jsonb,
  proprietarios jsonb NOT NULL DEFAULT '[]'::jsonb,
  atos jsonb NOT NULL DEFAULT '[]'::jsonb,
  onus jsonb NOT NULL DEFAULT '[]'::jsonb,
  extracted jsonb NOT NULL DEFAULT '{}'::jsonb,
  extraction_source varchar NOT NULL DEFAULT 'deterministico',
  raw_text text NOT NULL DEFAULT '',
  review_status varchar NOT NULL DEFAULT 'pendente',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX index_records_batch_idx ON public.index_records(batch_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.index_records TO authenticated;
GRANT ALL ON public.index_records TO service_role;
ALTER TABLE public.index_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY index_records_all ON public.index_records FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.index_batches b WHERE b.id = index_records.batch_id AND ((b.created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.index_batches b WHERE b.id = index_records.batch_id AND b.created_by = auth.uid()));

CREATE TRIGGER index_batches_set_updated_at BEFORE UPDATE ON public.index_batches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER index_records_set_updated_at BEFORE UPDATE ON public.index_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();