/*
  # Create Rahgir Travel Safety Platform Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `role` (text) - 'traveler', 'local', or 'admin'
      - `full_name` (text)
      - `trust_score` (integer) - reputation points
      - `location` (text) - city/region for locals
      - `verified` (boolean) - verification status for locals
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `queries`
      - `id` (uuid, primary key)
      - `traveler_id` (uuid, references profiles)
      - `location` (text) - where they need help
      - `category` (text) - 'safety', 'price', 'route', 'food'
      - `question` (text) - the actual question
      - `is_anonymous` (boolean) - display anonymously
      - `status` (text) - 'open', 'answered', 'resolved'
      - `created_at` (timestamptz)
    
    - `answers`
      - `id` (uuid, primary key)
      - `query_id` (uuid, references queries)
      - `local_id` (uuid, references profiles)
      - `answer_text` (text)
      - `helpful_count` (integer) - upvotes
      - `created_at` (timestamptz)
    
    - `verifications`
      - `id` (uuid, primary key)
      - `local_id` (uuid, references profiles)
      - `document_type` (text) - 'id', 'address_proof'
      - `document_url` (text) - storage URL
      - `status` (text) - 'pending', 'approved', 'rejected'
      - `reviewed_by` (uuid, references profiles)
      - `reviewed_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Profiles: Users can read all, update only their own
    - Queries: Travelers can create/update own, all can read
    - Answers: Locals can create, all can read
    - Verifications: Locals can create own, admins can review
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'traveler' CHECK (role IN ('traveler', 'local', 'admin')),
  full_name text,
  trust_score integer DEFAULT 0,
  location text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create queries table
CREATE TABLE IF NOT EXISTS queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  traveler_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  location text NOT NULL,
  category text NOT NULL CHECK (category IN ('safety', 'price', 'route', 'food')),
  question text NOT NULL,
  is_anonymous boolean DEFAULT true,
  status text DEFAULT 'open' CHECK (status IN ('open', 'answered', 'resolved')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view queries"
  ON queries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Travelers can create queries"
  ON queries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = traveler_id);

CREATE POLICY "Travelers can update own queries"
  ON queries FOR UPDATE
  TO authenticated
  USING (auth.uid() = traveler_id)
  WITH CHECK (auth.uid() = traveler_id);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid REFERENCES queries(id) ON DELETE CASCADE,
  local_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  answer_text text NOT NULL,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view answers"
  ON answers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Locals can create answers"
  ON answers FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = local_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('local', 'admin')
    )
  );

-- Create verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('id', 'address_proof')),
  document_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locals can view own verifications"
  ON verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = local_id);

CREATE POLICY "Admins can view all verifications"
  ON verifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Locals can create verifications"
  ON verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = local_id);

CREATE POLICY "Admins can update verifications"
  ON verifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'traveler')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
