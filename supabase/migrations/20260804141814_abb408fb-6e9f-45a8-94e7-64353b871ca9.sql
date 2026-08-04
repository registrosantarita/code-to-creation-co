ALTER TABLE public.segments
  ADD COLUMN IF NOT EXISTS altitude_from_m numeric,
  ADD COLUMN IF NOT EXISTS altitude_to_m numeric;

ALTER TABLE public.parcels
  ADD COLUMN IF NOT EXISTS altitude_min_m numeric,
  ADD COLUMN IF NOT EXISTS altitude_max_m numeric,
  ADD COLUMN IF NOT EXISTS altitude_mean_m numeric;