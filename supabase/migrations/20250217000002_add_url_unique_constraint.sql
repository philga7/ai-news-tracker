-- Add unique constraint on url column
ALTER TABLE articles
ADD CONSTRAINT articles_url_key UNIQUE (url);

-- Add an index to improve query performance
CREATE INDEX IF NOT EXISTS articles_url_idx ON articles(url);
