CREATE TABLE public.question_check_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(160) NOT NULL,
  protocolo varchar(80) NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  tipo_titulo varchar(60) NOT NULL DEFAULT '',
  secoes text[] NOT NULL DEFAULT '{}',
  respostas jsonb NOT NULL DEFAULT '{}'::jsonb,
  exigencias jsonb NOT NULL DEFAULT '[]'::jsonb,
  alertas jsonb NOT NULL DEFAULT '[]'::jsonb,
  nota_exigencia text NOT NULL DEFAULT '',
  lista_alertas text NOT NULL DEFAULT '',
  status varchar(20) NOT NULL DEFAULT 'em_andamento',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_check_sessions TO authenticated;
GRANT ALL ON public.question_check_sessions TO service_role;

ALTER TABLE public.question_check_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia suas conferências QuestionCheck"
ON public.question_check_sessions FOR ALL TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE INDEX question_check_sessions_created_by_idx ON public.question_check_sessions (created_by, updated_at DESC);

CREATE TRIGGER question_check_sessions_updated_at
BEFORE UPDATE ON public.question_check_sessions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();