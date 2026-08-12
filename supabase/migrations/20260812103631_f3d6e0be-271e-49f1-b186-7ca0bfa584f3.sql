ALTER TABLE public.index_records
  ADD COLUMN IF NOT EXISTS adquirente text,
  ADD COLUMN IF NOT EXISTS conjuge_adq text,
  ADD COLUMN IF NOT EXISTS transmitente text,
  ADD COLUMN IF NOT EXISTS conjuge_transm text,
  ADD COLUMN IF NOT EXISTS usufrutuario text,
  ADD COLUMN IF NOT EXISTS conjuge_usu text,
  ADD COLUMN IF NOT EXISTS prenotacao text,
  ADD COLUMN IF NOT EXISTS ato text,
  ADD COLUMN IF NOT EXISTS data_ato date,
  ADD COLUMN IF NOT EXISTS selo text;