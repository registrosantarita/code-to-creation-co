ALTER TABLE public.question_check_sessions
  ADD COLUMN IF NOT EXISTS especialidade text NOT NULL DEFAULT 'registro_imoveis';
ALTER TABLE public.question_check_sessions
  DROP CONSTRAINT IF EXISTS question_check_sessions_especialidade_check;
ALTER TABLE public.question_check_sessions
  ADD CONSTRAINT question_check_sessions_especialidade_check
  CHECK (especialidade IN ('registro_imoveis', 'rcpj'));