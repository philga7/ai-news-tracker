/*
  # Create news tracking system tables

  1. New Tables
    - `articles`
      - Stores news articles with AI-enhanced metadata
    - `user_preferences`
      - Stores user preferences for personalization
    - `topics`
      - Tracks trending topics and their statistics

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source text NOT NULL,
  url text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  category text NOT NULL,
  importance text CHECK (importance IN ('high', 'medium', 'low')),
  summary text,
  sentiment text CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  ai_analysis jsonb,
  created_at timestamptz DEFAULT now()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  categories text[] DEFAULT ARRAY['Technology', 'Finance', 'Environment'],
  sources text[] DEFAULT ARRAY['Tech Daily', 'Financial Times', 'Green News'],
  alert_frequency text DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  count integer DEFAULT 1,
  sentiment text CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  last_updated timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Articles are viewable by everyone"
  ON articles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "User preferences are viewable by owner"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "User preferences are updatable by owner"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Topics are viewable by everyone"
  ON topics FOR SELECT
  TO authenticated
  USING (true);