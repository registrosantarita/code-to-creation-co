ALTER TABLE public.index_records
  ADD COLUMN IF NOT EXISTS ultima_ficha character varying,
  ADD COLUMN IF NOT EXISTS certificacao character varying,
  ADD COLUMN IF NOT EXISTS registro_anterior character varying,
  ADD COLUMN IF NOT EXISTS encerrada boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS matriculas_abertas text[] NOT NULL DEFAULT '{}'::text[];