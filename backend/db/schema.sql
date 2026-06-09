-- منصة اكتشف ريف السعودية — PostgreSQL
-- experiences = الخدمات/التجارب المعروضة على المنصة

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── المستخدمون ───
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('visitor', 'provider', 'admin')),
  provider_host VARCHAR(200),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- ─── الخدمات / التجارب ───
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id INTEGER UNIQUE,
  title VARCHAR(300) NOT NULL,
  region VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  duration VARCHAR(80) NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  image_url TEXT NOT NULL,
  host VARCHAR(200) NOT NULL,
  max_group INTEGER NOT NULL CHECK (max_group >= 1),
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  booking_includes JSONB NOT NULL DEFAULT '[]'::jsonb,
  booking_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  heritage_story TEXT,
  host_story TEXT,
  host_name VARCHAR(200),
  host_title VARCHAR(200),
  why_special TEXT,
  preview_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiences_region_category ON experiences(region, category);
CREATE INDEX IF NOT EXISTS idx_experiences_host ON experiences(host);
CREATE INDEX IF NOT EXISTS idx_experiences_active ON experiences(active);
CREATE INDEX IF NOT EXISTS idx_experiences_featured ON experiences(featured);

-- ─── الحجوزات (consistency عالي) ───
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(32) NOT NULL UNIQUE,
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE RESTRICT,
  experience_title VARCHAR(300) NOT NULL,
  experience_region VARCHAR(120) NOT NULL,
  host VARCHAR(200) NOT NULL,
  date_label VARCHAR(80) NOT NULL,
  time_label VARCHAR(80) NOT NULL,
  guests INTEGER NOT NULL CHECK (guests >= 1),
  group_type VARCHAR(20) NOT NULL CHECK (group_type IN ('family', 'youth')),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('mada', 'apple', 'card', 'cash')),
  price_per_person INTEGER NOT NULL CHECK (price_per_person >= 0),
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  service_fee INTEGER NOT NULL CHECK (service_fee >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  user_phone VARCHAR(20),
  user_name VARCHAR(120),
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_experience ON bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_phone ON bookings(user_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_host ON bookings(host);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

-- ─── طلبات إضافة تجربة ───
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  region VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 1),
  duration VARCHAR(80) NOT NULL,
  host_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- ─── تعليقات الزوار ───
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) ON DELETE SET NULL,
  experience_title VARCHAR(300) NOT NULL,
  host VARCHAR(200),
  user_name VARCHAR(120) NOT NULL,
  user_phone VARCHAR(20),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  highlight VARCHAR(20) NOT NULL DEFAULT 'experience'
    CHECK (highlight IN ('benefit', 'ease', 'experience')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(featured) WHERE visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_reviews_host ON reviews(host);

-- ─── استفسارات الزوار ───
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name VARCHAR(120) NOT NULL,
  user_phone VARCHAR(20),
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'answered', 'closed')),
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
