-- Migration: Add ratings table and trust engine logic
-- Covers: FR18 - FR20 (Ratings), FR15 - FR17 (Trust Engine)

-- 1. Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid REFERENCES answers(id) ON DELETE CASCADE,
  traveler_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(answer_id, traveler_id) -- One rating per answer per traveler
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Travelers can rate answers"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = traveler_id);

-- 2. Add blocked_status and status to profiles for moderation (FR26)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- 3. Trust Engine Logic: Update trust_score based on ratings
-- This function calculates the average rating for a local and updates their profile
CREATE OR REPLACE FUNCTION update_local_trust_score()
RETURNS TRIGGER AS $$
DECLARE
  v_local_id uuid;
  v_avg_rating numeric;
BEGIN
  -- Get the local_id from the answer being rated
  SELECT local_id INTO v_local_id FROM answers WHERE id = NEW.answer_id;
  
  -- Calculate average rating for all answers by this local
  SELECT AVG(r.rating) INTO v_avg_rating
  FROM ratings r
  JOIN answers a ON r.answer_id = a.id
  WHERE a.local_id = v_local_id;
  
  -- Update trust_score (mapped to 0-100 scale: avg 5.0 -> 100)
  -- Or just keep it as 1-5 * 20
  UPDATE profiles 
  SET trust_score = COALESCE(ROUND(v_avg_rating * 20), 0)
  WHERE id = v_local_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update trust score whenever a new rating is inserted
DROP TRIGGER IF EXISTS on_rating_inserted ON ratings;
CREATE TRIGGER on_rating_inserted
  AFTER INSERT OR UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_local_trust_score();

-- 4. Create Admin Logs table (FR24)
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  target_id uuid,
  details jsonb,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
