-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin','official','operator','reviewer','read_only');
CREATE TYPE public.analysis_status AS ENUM ('draft','processing','ready','review_pending','completed','archived','error');
CREATE TYPE public.document_source_type AS ENUM ('upload','pasted_text','imported');
CREATE TYPE public.document_category AS ENUM ('memorial','matricula','escritura','planta','norma','tabela_tecnica','imagem_tecnica','documento_complementar','nao_classificado');
CREATE TYPE public.document_status AS ENUM ('uploaded','parsed','failed','archived');
CREATE TYPE public.comparison_type AS ENUM ('memorial_to_memorial','boundary_to_boundary','memorial_to_registry','custom');
CREATE TYPE public.comparison_status AS ENUM ('pending','running','completed','failed','review_pending');
CREATE TYPE public.result_classification AS ENUM ('compatible','compatible_with_remarks','incompatible','inconclusive');
CREATE TYPE public.finding_severity AS ENUM ('critical','moderate','informative','inconclusive');

-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name varchar(200) NOT NULL DEFAULT '',
  email varchar(255) NOT NULL DEFAULT '',
  status varchar(30) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- =========================
-- ROLES
-- =========================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- =========================
-- TIMESTAMP HELPER
-- =========================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- New user -> profile + default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'operator')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- ANALYSES
-- =========================
CREATE TABLE public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  objective text NOT NULL DEFAULT '',
  status public.analysis_status NOT NULL DEFAULT 'draft',
  created_by uuid NOT NULL,
  responsible_user_id uuid,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);
CREATE INDEX idx_analyses_created_by ON public.analyses(created_by);
CREATE INDEX idx_analyses_status ON public.analyses(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analyses TO authenticated;
GRANT ALL ON public.analyses TO service_role;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_access_analysis(_analysis_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.analyses a
    WHERE a.id = _analysis_id
      AND (a.created_by = _user_id OR a.responsible_user_id = _user_id OR public.has_role(_user_id,'admin'))
  )
$$;

CREATE POLICY "analyses_select" ON public.analyses FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR responsible_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "analyses_insert" ON public.analyses FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "analyses_update" ON public.analyses FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR responsible_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (created_by = auth.uid() OR responsible_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "analyses_delete" ON public.analyses FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_analyses_updated BEFORE UPDATE ON public.analyses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- DOCUMENTS
-- =========================
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  source_type public.document_source_type NOT NULL DEFAULT 'upload',
  file_name varchar(255),
  file_extension varchar(20),
  mime_type varchar(120),
  file_size_bytes bigint,
  storage_path text,
  document_category public.document_category NOT NULL DEFAULT 'nao_classificado',
  language_code varchar(10) NOT NULL DEFAULT 'pt-BR',
  original_text text,
  extracted_text text,
  status public.document_status NOT NULL DEFAULT 'uploaded',
  error_message text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_documents_analysis ON public.documents(analysis_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_all" ON public.documents FOR ALL TO authenticated
  USING (public.can_access_analysis(analysis_id, auth.uid()))
  WITH CHECK (public.can_access_analysis(analysis_id, auth.uid()));
CREATE TRIGGER trg_documents_updated BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- PARCELS (extração normalizada)
-- =========================
CREATE TABLE public.parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  analysis_id uuid NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  label varchar(255),
  area_m2 numeric(18,4),
  declared_perimeter_m numeric(18,4),
  computed_perimeter_m numeric(18,4),
  vertex_count integer NOT NULL DEFAULT 0,
  confrontantes text[] NOT NULL DEFAULT '{}',
  raw_extraction jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_parcels_document ON public.parcels(document_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parcels TO authenticated;
GRANT ALL ON public.parcels TO service_role;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parcels_all" ON public.parcels FOR ALL TO authenticated
  USING (public.can_access_analysis(analysis_id, auth.uid()))
  WITH CHECK (public.can_access_analysis(analysis_id, auth.uid()));

CREATE TABLE public.segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id uuid NOT NULL REFERENCES public.parcels(id) ON DELETE CASCADE,
  analysis_id uuid NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  seq integer NOT NULL,
  from_vertex varchar(60),
  to_vertex varchar(60),
  bearing_text varchar(60),
  azimuth_deg numeric(9,5),
  distance_m numeric(18,4),
  confrontante text,
  raw_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_segments_parcel ON public.segments(parcel_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.segments TO authenticated;
GRANT ALL ON public.segments TO service_role;
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "segments_all" ON public.segments FOR ALL TO authenticated
  USING (public.can_access_analysis(analysis_id, auth.uid()))
  WITH CHECK (public.can_access_analysis(analysis_id, auth.uid()));

-- =========================
-- COMPARISONS + FINDINGS
-- =========================
CREATE TABLE public.comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  comparison_type public.comparison_type NOT NULL DEFAULT 'memorial_to_memorial',
  status public.comparison_status NOT NULL DEFAULT 'pending',
  classification public.result_classification,
  document_a_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  document_b_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  tolerances jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_comparisons_analysis ON public.comparisons(analysis_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comparisons TO authenticated;
GRANT ALL ON public.comparisons TO service_role;
ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comparisons_all" ON public.comparisons FOR ALL TO authenticated
  USING (public.can_access_analysis(analysis_id, auth.uid()))
  WITH CHECK (public.can_access_analysis(analysis_id, auth.uid()));
CREATE TRIGGER trg_comparisons_updated BEFORE UPDATE ON public.comparisons
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_id uuid NOT NULL REFERENCES public.comparisons(id) ON DELETE CASCADE,
  analysis_id uuid NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  severity public.finding_severity NOT NULL DEFAULT 'informative',
  code varchar(80) NOT NULL,
  title varchar(255) NOT NULL,
  description text NOT NULL DEFAULT '',
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviewed boolean NOT NULL DEFAULT false,
  reviewer_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_findings_comparison ON public.findings(comparison_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.findings TO authenticated;
GRANT ALL ON public.findings TO service_role;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "findings_all" ON public.findings FOR ALL TO authenticated
  USING (public.can_access_analysis(analysis_id, auth.uid()))
  WITH CHECK (public.can_access_analysis(analysis_id, auth.uid()));

-- =========================
-- AUDIT
-- =========================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  entity_type varchar(60) NOT NULL,
  entity_id uuid,
  action varchar(80) NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_actor ON public.audit_logs(actor_id);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_select" ON public.audit_logs FOR SELECT TO authenticated
  USING (actor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());