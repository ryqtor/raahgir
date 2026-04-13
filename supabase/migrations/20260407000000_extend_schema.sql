-- Extend Rahgir Schema for Scam Reporting and AI Safety Tips

-- Create scam_reports table
CREATE TABLE IF NOT EXISTS scam_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  location text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'dismissed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified scam reports"
  ON scam_reports FOR SELECT
  TO authenticated
  USING (status = 'verified' OR auth.uid() = reporter_id OR (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  ));

CREATE POLICY "Users can report scams"
  ON scam_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can moderate scam reports"
  ON scam_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create ai_safety_tips table
CREATE TABLE IF NOT EXISTS ai_safety_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  category text NOT NULL CHECK (category IN ('safety', 'price', 'route', 'food', 'scam')),
  tip_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_safety_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view AI safety tips"
  ON ai_safety_tips FOR SELECT
  TO authenticated
  USING (true);

-- Add rating to answers if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'answers' AND column_name = 'rating') THEN
    ALTER TABLE answers ADD COLUMN rating integer DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);
  END IF;
END $$;
