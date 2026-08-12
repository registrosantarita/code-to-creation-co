ALTER TABLE public.index_records
  ADD COLUMN IF NOT EXISTS cep text,
  ADD COLUMN IF NOT EXISTS tipo_logradouro text,
  ADD COLUMN IF NOT EXISTS logradouro text,
  ADD COLUMN IF NOT EXISTS numero_logradouro text,
  ADD COLUMN IF NOT EXISTS tipo_rural text,
  ADD COLUMN IF NOT EXISTS denominacao_rural text,
  ADD COLUMN IF NOT EXISTS lote text,
  ADD COLUMN IF NOT EXISTS quadra text,
  ADD COLUMN IF NOT EXISTS cim text;