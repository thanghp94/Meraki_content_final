-- Add indexes to improve vocabulary query performance
-- These indexes will speed up the lazy loading queries

-- Index for word search (ILIKE queries)
CREATE INDEX IF NOT EXISTS idx_vocabulary_word_gin ON meraki.vocabulary USING gin(word gin_trgm_ops);

-- Index for definition search (ILIKE queries)
CREATE INDEX IF NOT EXISTS idx_vocabulary_definition_gin ON meraki.vocabulary USING gin(definition gin_trgm_ops);

-- Index for first letter filtering
CREATE INDEX IF NOT EXISTS idx_vocabulary_word_first_letter ON meraki.vocabulary (UPPER(LEFT(word, 1)));

-- Index for tags filtering (GIN index for array operations)
CREATE INDEX IF NOT EXISTS idx_vocabulary_tags_gin ON meraki.vocabulary USING gin(tags);

-- Index for created_at ordering (already exists but ensuring it's there)
CREATE INDEX IF NOT EXISTS idx_vocabulary_created_at ON meraki.vocabulary (created_at DESC);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_vocabulary_word_created_at ON meraki.vocabulary (word, created_at DESC);

-- Enable pg_trgm extension if not already enabled (for fuzzy text search)
-- This needs to be run by a superuser
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
