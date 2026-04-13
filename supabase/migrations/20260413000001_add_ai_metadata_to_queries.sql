-- Migration to add AI analysis columns to queries table
ALTER TABLE queries ADD COLUMN IF NOT EXISTS ai_scam_risk text DEFAULT 'low';
ALTER TABLE queries ADD COLUMN IF NOT EXISTS ai_safety_tips text[];
ALTER TABLE queries ADD COLUMN IF NOT EXISTS ai_explanation text;
ALTER TABLE queries ADD COLUMN IF NOT EXISTS ai_confidence numeric DEFAULT 0;
