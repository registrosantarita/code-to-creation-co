ALTER TABLE public.index_records
  ADD COLUMN IF NOT EXISTS area_hectare numeric,
  ADD COLUMN IF NOT EXISTS perimetro_m numeric,
  ADD COLUMN IF NOT EXISTS area_construida_m2 numeric;