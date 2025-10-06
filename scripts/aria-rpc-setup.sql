-- ARIA RPC Setup: Create match_documents and match_passages functions with RLS policies
-- Run this in the Supabase SQL editor to enable ARIA search functionality

-- Ensure pgvector extension is available
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents similarity function
CREATE OR REPLACE FUNCTION public.match_documents(query_embedding double precision[], match_count integer DEFAULT 8)
RETURNS TABLE(pmcid text, title text, year text, score double precision)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT d.pmcid, d.title, d.year,
         1/(1 + sqrt(sum( (e.embedding[i] - query_embedding[i])^2 ))) AS score
  FROM doc_embeddings e
  JOIN documents d ON d.pmcid = e.pmcid,
       generate_subscripts(e.embedding, 1) AS i
  GROUP BY d.pmcid, d.title, d.year
  ORDER BY score DESC
  LIMIT match_count;
$$;

-- Passages similarity function
CREATE OR REPLACE FUNCTION public.match_passages(query_embedding double precision[], match_count integer DEFAULT 8)
RETURNS TABLE(pmcid text, section text, text text, score double precision)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT p.pmcid, p.section, p.text,
         1/(1 + sqrt(sum( (e.embedding[i] - query_embedding[i])^2 ))) AS score
  FROM passage_embeddings e
  JOIN passages p ON p.id = e.passage_id,
       generate_subscripts(e.embedding, 1) AS i
  GROUP BY p.pmcid, p.section, p.text
  ORDER BY score DESC
  LIMIT match_count;
$$;

-- Grant execute permissions to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.match_documents(double precision[], integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_passages(double precision[], integer) TO anon, authenticated;

-- Enable RLS on all tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passage_embeddings ENABLE ROW LEVEL SECURITY;

-- Create read-only policies for public access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='documents' AND policyname='public_read_documents') THEN
    CREATE POLICY public_read_documents ON public.documents FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='doc_embeddings' AND policyname='public_read_doc_embeddings') THEN
    CREATE POLICY public_read_doc_embeddings ON public.doc_embeddings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='passages' AND policyname='public_read_passages') THEN
    CREATE POLICY public_read_passages ON public.passages FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='passage_embeddings' AND policyname='public_read_passage_embeddings') THEN
    CREATE POLICY public_read_passage_embeddings ON public.passage_embeddings FOR SELECT USING (true);
  END IF;
END$$;
