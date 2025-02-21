-- Add RLS policies for article insertions and updates
-- These are needed for the CFP feed service to work

-- Policy for inserting new articles (needed for feed items)
CREATE POLICY "Service role can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for updating existing articles (needed for updating original_urls)
CREATE POLICY "Service role can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add comment to track migration purpose
COMMENT ON TABLE articles IS 'News articles table with RLS policies for read/write operations';
