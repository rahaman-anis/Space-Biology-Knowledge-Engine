-- Production Data ↔ Feature Mapping: SQL RPCs for safe schema introspection
-- Run this script in your Supabase SQL Editor to create the required functions

-- 1) List allowed tables (whitelist)
CREATE OR REPLACE FUNCTION public.dm_allowed_tables()
RETURNS text[]
LANGUAGE sql
STABLE
AS $$
  SELECT ARRAY[
    'docs',
    'claims',
    'mechanisms',
    'passages',
    'gaps'
  ];
$$;

-- 2) Introspect a single table: columns, row_count, null_count per column, and 3 sample values
CREATE OR REPLACE FUNCTION public.dm_introspect_table(tname text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  allowlist text[];
  col_rec record;
  col_stats jsonb := '[]'::jsonb;
  total_rows bigint;
  null_count bigint;
  samples text[];
BEGIN
  SELECT dm_allowed_tables() INTO allowlist;
  IF NOT (tname = ANY(allowlist)) THEN
    RAISE EXCEPTION 'table % not allowed', tname;
  END IF;

  EXECUTE format('SELECT count(*) FROM %I', tname) INTO total_rows;

  FOR col_rec IN
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = tname
    ORDER BY ordinal_position
  LOOP
    -- Count nulls
    EXECUTE format('SELECT count(*) FROM %I WHERE %I IS NULL', tname, col_rec.column_name)
      INTO null_count;
    
    -- Sample distinct values (limit 3)
    EXECUTE format(
      'SELECT array_agg(val) FROM (SELECT %I::text AS val FROM %I WHERE %I IS NOT NULL GROUP BY 1 ORDER BY 1 LIMIT 3) s',
      col_rec.column_name, tname, col_rec.column_name
    ) INTO samples;

    col_stats := col_stats || jsonb_build_object(
      'column', col_rec.column_name,
      'type', col_rec.data_type,
      'nulls', null_count,
      'samples', COALESCE(to_jsonb(samples), '[]'::jsonb)
    );
  END LOOP;

  RETURN json_build_object(
    'table', tname,
    'row_count', total_rows,
    'columns', col_stats
  );
END;
$$;

-- 3) Introspect all allowed tables in one go
CREATE OR REPLACE FUNCTION public.dm_introspect_all()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  t text;
  results jsonb := '[]'::jsonb;
  allowlist text[];
BEGIN
  SELECT dm_allowed_tables() INTO allowlist;
  FOREACH t IN ARRAY allowlist LOOP
    results := results || dm_introspect_table(t)::jsonb;
  END LOOP;
  RETURN json_build_object('tables', results);
END;
$$;

-- Grants (allow anon role to execute)
REVOKE ALL ON FUNCTION public.dm_introspect_table(text) FROM public;
REVOKE ALL ON FUNCTION public.dm_introspect_all() FROM public;
GRANT EXECUTE ON FUNCTION public.dm_introspect_table(text) TO anon;
GRANT EXECUTE ON FUNCTION public.dm_introspect_all() TO anon;
