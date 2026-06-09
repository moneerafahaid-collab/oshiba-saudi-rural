-- بيانات الزوار للتحليل المستقبلي
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS interest_type VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT FALSE;

DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT users_age_check
    CHECK (age IS NULL OR (age >= 5 AND age <= 120));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT users_interest_type_check
    CHECK (interest_type IS NULL OR interest_type IN ('adventure', 'exploration', 'both'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
  ON users (LOWER(email)) WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_interest ON users(interest_type) WHERE role = 'visitor';
CREATE INDEX IF NOT EXISTS idx_users_age ON users(age) WHERE role = 'visitor';
