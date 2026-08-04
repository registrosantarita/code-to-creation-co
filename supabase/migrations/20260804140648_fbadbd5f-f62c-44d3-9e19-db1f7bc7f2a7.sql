create extension if not exists vector with schema extensions;

create type public.norm_type as enum (
  'lei','decreto','provimento','resolucao','normas_servico',
  'parecer','decisao_administrativa','sumula','enunciado','outro'
);

create type public.norm_status as enum ('vigente','revogada','suspensa','em_consulta');

create table public.norms (
  id uuid primary key default gen_random_uuid(),
  title varchar not null,
  issuer varchar not null default '',
  norm_type public.norm_type not null default 'outro',
  number varchar,
  year integer,
  hierarchy integer not null default 50,
  ementa text not null default '',
  full_text text not null default '',
  source_url text,
  jurisdiction varchar not null default 'nacional',
  effective_from date,
  effective_to date,
  status public.norm_status not null default 'vigente',
  tags text[] not null default '{}'::text[],
  chunk_count integer not null default 0,
  embedding_model varchar not null default '',
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.norm_chunks (
  id uuid primary key default gen_random_uuid(),
  norm_id uuid not null references public.norms(id) on delete cascade,
  seq integer not null,
  content text not null,
  embedding extensions.vector(1536),
  created_at timestamptz not null default now()
);

create index norms_created_by_idx on public.norms (created_by);
create index norm_chunks_norm_id_idx on public.norm_chunks (norm_id);
create index norm_chunks_embedding_idx on public.norm_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

grant select, insert, update, delete on public.norms to authenticated;
grant all on public.norms to service_role;
grant select, insert, update, delete on public.norm_chunks to authenticated;
grant all on public.norm_chunks to service_role;

alter table public.norms enable row level security;
alter table public.norm_chunks enable row level security;

create policy norms_select on public.norms
  for select to authenticated using (true);
create policy norms_insert on public.norms
  for insert to authenticated with check (created_by = auth.uid());
create policy norms_update on public.norms
  for update to authenticated
  using (created_by = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (created_by = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy norms_delete on public.norms
  for delete to authenticated
  using (created_by = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy norm_chunks_select on public.norm_chunks
  for select to authenticated using (true);
create policy norm_chunks_write on public.norm_chunks
  for all to authenticated
  using (exists (select 1 from public.norms n where n.id = norm_id
    and (n.created_by = auth.uid() or public.has_role(auth.uid(),'admin'))))
  with check (exists (select 1 from public.norms n where n.id = norm_id
    and (n.created_by = auth.uid() or public.has_role(auth.uid(),'admin'))));

create trigger trg_norms_updated before update on public.norms
  for each row execute function public.set_updated_at();

create or replace function public.buscar_normas_semantico(
  query_embedding extensions.vector(1536),
  match_count integer default 8,
  filtro_status public.norm_status default null
)
returns table (
  chunk_id uuid,
  norm_id uuid,
  seq integer,
  content text,
  similarity double precision,
  title varchar,
  issuer varchar,
  norm_type public.norm_type,
  number varchar,
  year integer,
  ementa text,
  source_url text,
  status public.norm_status,
  effective_from date,
  effective_to date
)
language sql
stable
set search_path = public, extensions
as $$
  select c.id, n.id, c.seq, c.content,
         1 - (c.embedding <=> query_embedding) as similarity,
         n.title, n.issuer, n.norm_type, n.number, n.year, n.ementa,
         n.source_url, n.status, n.effective_from, n.effective_to
  from public.norm_chunks c
  join public.norms n on n.id = c.norm_id
  where c.embedding is not null
    and (filtro_status is null or n.status = filtro_status)
  order by c.embedding <=> query_embedding
  limit greatest(1, least(coalesce(match_count, 8), 50))
$$;

revoke execute on function public.buscar_normas_semantico(extensions.vector, integer, public.norm_status) from public;
grant execute on function public.buscar_normas_semantico(extensions.vector, integer, public.norm_status) to authenticated;