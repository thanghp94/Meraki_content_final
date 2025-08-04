-- Add indexes to improve library page query performance
-- These indexes will speed up the lazy loading queries for topics and content

-- Index for topic queries by program and unit
CREATE INDEX IF NOT EXISTS idx_topic_program_unit ON meraki.topic (program, unit);

-- Index for topic ordering
CREATE INDEX IF NOT EXISTS idx_topic_order_index ON meraki.topic (COALESCE(order_index, 999999), topic);

-- Index for content queries by topicid
CREATE INDEX IF NOT EXISTS idx_content_topicid ON meraki.content (topicid);

-- Index for content ordering
CREATE INDEX IF NOT EXISTS idx_content_order_index ON meraki.content (COALESCE(order_index, 999999), date_created DESC);

-- Index for question counts by contentid
CREATE INDEX IF NOT EXISTS idx_question_contentid ON meraki.question (contentid);

-- Composite index for content with topic filtering
CREATE INDEX IF NOT EXISTS idx_content_topicid_order ON meraki.content (topicid, COALESCE(order_index, 999999), date_created DESC);

-- Index for content visibility filtering
CREATE INDEX IF NOT EXISTS idx_content_visible ON meraki.content (visible) WHERE visible IS NOT NULL;
