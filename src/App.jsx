-- ═══════════════════════════════════════════════════════════════
-- PICKUPOS DATABASE SCHEMA - FIXED VERSION
-- DC Location: 28.5472219, 77.0254858
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════ 1. ASSIGNMENTS TABLE ═══════════════════

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Assignment Details
  client_name TEXT NOT NULL,
  client_id TEXT,
  rider_name TEXT,
  rider_id TEXT NOT NULL,
  rider_code TEXT,
  
  -- Pickup Details
  pickup_type TEXT NOT NULL CHECK (pickup_type IN ('SDD', 'NDD', 'AIR')),
  cutoff TEXT NOT NULL,
  client_category TEXT NOT NULL,
  vehicle_no TEXT NOT NULL,
  
  -- Location
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  geofence_radius INTEGER DEFAULT 500,
  
  -- Status
  status TEXT DEFAULT 'active',
  
  -- Completion Data
  shipment_count INTEGER DEFAULT 0,
  remarks TEXT,
  pod_photo TEXT,
  
  -- Timestamps
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Upload Metadata
  upload_batch_id UUID,
  uploaded_by TEXT,
  upload_date DATE DEFAULT CURRENT_DATE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assignments_rider_id ON assignments(rider_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_pickup_type ON assignments(pickup_type);
CREATE INDEX IF NOT EXISTS idx_assignments_upload_date ON assignments(upload_date);
CREATE INDEX IF NOT EXISTS idx_assignments_batch ON assignments(upload_batch_id);

COMMENT ON TABLE assignments IS 'Daily rider assignments uploaded via CSV';


-- ═══════════════════ 2. RIDER STATUS TABLE ═══════════════════

CREATE TABLE IF NOT EXISTS rider_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  rider_id TEXT NOT NULL,
  rider_name TEXT,
  
  status TEXT NOT NULL,
  previous_status TEXT,
  
  location JSONB,
  geofence_entered TEXT,
  geofence_exited TEXT,
  
  assignment_id UUID REFERENCES assignments(id),
  node_index INTEGER,
  node_name TEXT,
  
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  duration_in_previous_status INTEGER,
  
  triggered_by TEXT DEFAULT 'geofence',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rider_status_rider_id ON rider_status(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_status_status ON rider_status(status);
CREATE INDEX IF NOT EXISTS idx_rider_status_timestamp ON rider_status(timestamp);
CREATE INDEX IF NOT EXISTS idx_rider_status_assignment ON rider_status(assignment_id);

COMMENT ON TABLE rider_status IS 'Real-time rider status changes';


-- ═══════════════════ 3. GEOFENCES TABLE ═══════════════════

CREATE TABLE IF NOT EXISTS geofences (
  id TEXT PRIMARY KEY,
  
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('dc', 'client', 'custom')),
  
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  radius INTEGER DEFAULT 500,
  
  address TEXT,
  client_id TEXT,
  category TEXT,
  
  active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_geofences_type ON geofences(type);
CREATE INDEX IF NOT EXISTS idx_geofences_active ON geofences(active);

COMMENT ON TABLE geofences IS 'All geofence zones - DC and client locations';


-- ═══════════════════ 4. RIDER LOCATIONS TABLE ═══════════════════

CREATE TABLE IF NOT EXISTS rider_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  rider_id TEXT NOT NULL,
  
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  altitude DECIMAL(10, 2),
  speed DECIMAL(10, 2),
  heading DECIMAL(10, 2),
  
  assignment_id UUID REFERENCES assignments(id),
  current_status TEXT,
  
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  device_timestamp TIMESTAMPTZ,
  
  battery_level INTEGER,
  is_mock BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rider_locations_rider_id ON rider_locations(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_locations_timestamp ON rider_locations(timestamp);
CREATE INDEX IF NOT EXISTS idx_rider_locations_assignment ON rider_locations(assignment_id);

COMMENT ON TABLE rider_locations IS 'Real-time GPS location tracking';


-- ═══════════════════ 5. PICKUP COMPLETIONS TABLE ═══════════════════

CREATE TABLE IF NOT EXISTS pickup_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  assignment_id UUID REFERENCES assignments(id) NOT NULL,
  rider_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  
  shipment_count INTEGER NOT NULL,
  remarks TEXT,
  issues TEXT,
  
  pod_photo TEXT,
  additional_photos JSONB,
  
  signature_data TEXT,
  recipient_name TEXT,
  recipient_phone TEXT,
  
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  
  custom_fields JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pickup_completions_assignment ON pickup_completions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_pickup_completions_rider ON pickup_completions(rider_id);
CREATE INDEX IF NOT EXISTS idx_pickup_completions_completed ON pickup_completions(completed_at);

COMMENT ON TABLE pickup_completions IS 'Detailed completion data from riders';


-- ═══════════════════ 6. STATUS HISTORY TABLE ═══════════════════

CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  assignment_id UUID REFERENCES assignments(id),
  rider_id TEXT NOT NULL,
  
  status TEXT NOT NULL,
  previous_status TEXT,
  
  entered_at TIMESTAMPTZ NOT NULL,
  exited_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  entered_location JSONB,
  exited_location JSONB,
  
  node_name TEXT,
  geofence_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_status_history_assignment ON status_history(assignment_id);
CREATE INDEX IF NOT EXISTS idx_status_history_rider ON status_history(rider_id);
CREATE INDEX IF NOT EXISTS idx_status_history_status ON status_history(status);

COMMENT ON TABLE status_history IS 'Historical status changes for analytics';


-- ═══════════════════ 7. UPLOAD BATCHES TABLE ═══════════════════

CREATE TABLE IF NOT EXISTS upload_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  pickup_type TEXT NOT NULL,
  filename TEXT,
  
  total_rows INTEGER NOT NULL,
  valid_rows INTEGER NOT NULL,
  error_rows INTEGER NOT NULL,
  
  errors JSONB,
  error_file_url TEXT,
  
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_upload_batches_type ON upload_batches(pickup_type);
CREATE INDEX IF NOT EXISTS idx_upload_batches_uploaded_at ON upload_batches(uploaded_at);

COMMENT ON TABLE upload_batches IS 'Track CSV upload batches';


-- ═══════════════════ ROW LEVEL SECURITY ═══════════════════

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_batches ENABLE ROW LEVEL SECURITY;

-- Basic policies (allow authenticated users to read)
CREATE POLICY IF NOT EXISTS "Allow authenticated read on assignments" 
  ON assignments FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated read on rider_status" 
  ON rider_status FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated read on geofences" 
  ON geofences FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated read on rider_locations" 
  ON rider_locations FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated insert on assignments" 
  ON assignments FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated insert on rider_status" 
  ON rider_status FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated insert on rider_locations" 
  ON rider_locations FOR INSERT 
  TO authenticated 
  WITH CHECK (true);


-- ═══════════════════ VIEWS FOR REPORTS ═══════════════════

CREATE OR REPLACE VIEW active_assignments AS
SELECT 
  a.id,
  a.rider_id,
  a.rider_name,
  a.client_name,
  a.pickup_type,
  a.status,
  a.shipment_count,
  a.assigned_at,
  (
    SELECT rs.timestamp 
    FROM rider_status rs 
    WHERE rs.rider_id = a.rider_id 
    ORDER BY rs.timestamp DESC 
    LIMIT 1
  ) as last_status_update,
  (
    SELECT rs.location 
    FROM rider_status rs 
    WHERE rs.rider_id = a.rider_id 
    ORDER BY rs.timestamp DESC 
    LIMIT 1
  ) as last_location
FROM assignments a
WHERE a.status != 'reached_origin' 
  AND a.status != 'cancelled'
  AND DATE(a.assigned_at) = CURRENT_DATE;

COMMENT ON VIEW active_assignments IS 'All active assignments for today';


CREATE OR REPLACE VIEW daily_summary AS
SELECT 
  upload_date,
  pickup_type,
  COUNT(*) as total_assignments,
  COUNT(*) FILTER (WHERE status IN ('reached_origin', 'completed_last')) as completed,
  COUNT(*) FILTER (WHERE status = 'active') as pending,
  SUM(shipment_count) as total_shipments
FROM assignments
GROUP BY upload_date, pickup_type
ORDER BY upload_date DESC, pickup_type;

COMMENT ON VIEW daily_summary IS 'Daily summary by pickup type';


-- ═══════════════════ INSERT DC GEOFENCE ═══════════════════

-- YOUR DC Location
INSERT INTO geofences (id, name, type, lat, lng, radius) VALUES
  ('DC_MAIN', 'Distribution Center - Faridabad', 'dc', 28.5472219, 77.0254858, 500)
ON CONFLICT (id) DO UPDATE SET
  lat = 28.5472219,
  lng = 77.0254858,
  name = 'Distribution Center - Faridabad';


-- ═══════════════════ HELPER FUNCTIONS ═══════════════════

-- Get rider current status
CREATE OR REPLACE FUNCTION get_rider_current_status(p_rider_id TEXT)
RETURNS TABLE (
  rider_id TEXT,
  current_status TEXT,
  last_location JSONB,
  last_update TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.rider_id,
    rs.status as current_status,
    rs.location as last_location,
    rs.timestamp as last_update
  FROM rider_status rs
  WHERE rs.rider_id = p_rider_id
  ORDER BY rs.timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;


-- ═══════════════════ VERIFICATION ═══════════════════

SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'assignments',
    'rider_status',
    'geofences',
    'rider_locations',
    'pickup_completions',
    'status_history',
    'upload_batches'
  )
ORDER BY tablename;
