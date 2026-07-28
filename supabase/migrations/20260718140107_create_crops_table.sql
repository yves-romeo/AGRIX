/*
# Create crops table for marketplace listings (single-tenant, no auth)

1. New Tables
- `crops`
  - `id` (uuid, primary key)
  - `crop_name` (text, not null) — name of the crop e.g. Maize
  - `quantity_kg` (numeric, not null) — expected harvest volume in kilograms
  - `location` (text, not null) — farmer's location
  - `created_at` (timestamptz, default now)

2. Security
- Enable RLS on `crops`.
- Single-tenant app (no sign-in): allow anon + authenticated full CRUD since the data
  is intentionally shared/public across the marketplace.

3. Notes
- No user_id column — the app has no auth flow, so rows are publicly visible to
  anyone visiting the marketplace, which is the intended behavior for a buyer directory.
*/

CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  quantity_kg numeric NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_crops" ON crops;
CREATE POLICY "anon_select_crops" ON crops FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_crops" ON crops;
CREATE POLICY "anon_insert_crops" ON crops FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_crops" ON crops;
CREATE POLICY "anon_update_crops" ON crops FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_crops" ON crops;
CREATE POLICY "anon_delete_crops" ON crops FOR DELETE
  TO anon, authenticated USING (true);
