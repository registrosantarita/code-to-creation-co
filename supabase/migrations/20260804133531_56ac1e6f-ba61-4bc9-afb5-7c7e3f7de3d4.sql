CREATE TABLE public.ai_usage_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id uuid REFERENCES public.analyses(id) ON DELETE CASCADE,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  operation character varying NOT NULL DEFAULT 'ocr',
  model character varying NOT NULL DEFAULT '',
  ocr_used boolean NOT NULL DEFAULT false,
  file_name character varying,
  file_extension character varying,
  file_size_bytes bigint,
  pages_estimated integer NOT NULL DEFAULT 0,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  credits_estimated numeric NOT NULL DEFAULT 0,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_usage_events_user_created ON public.ai_usage_events (user_id, created_at DESC);
CREATE INDEX idx_ai_usage_events_analysis ON public.ai_usage_events (analysis_id);

GRANT SELECT, INSERT ON public.ai_usage_events TO authenticated;
GRANT ALL ON public.ai_usage_events TO service_role;

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_select_own" ON public.ai_usage_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "ai_usage_insert_own" ON public.ai_usage_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());