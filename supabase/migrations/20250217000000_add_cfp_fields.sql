ALTER TABLE articles
ADD COLUMN IF NOT EXISTS is_cfp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS original_url TEXT;

-- Index for better performance when querying CFP articles
CREATE INDEX IF NOT EXISTS idx_articles_is_cfp ON articles(is_cfp);
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS is_cfp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS original_url TEXT;

-- Index for better performance when querying CFP articles
CREATE INDEX IF NOT EXISTS idx_articles_is_cfp ON articles(is_cfp);
