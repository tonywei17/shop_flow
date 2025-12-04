-- Migration: Add data_scope_type and allowed_department_ids to roles table
-- This enables more granular data access control for roles

-- Add data_scope_type column with enum-like values
-- Values: 'all', 'self_and_descendants', 'self_only', 'custom'
ALTER TABLE roles ADD COLUMN IF NOT EXISTS data_scope_type text NOT NULL DEFAULT 'all';

-- Add allowed_department_ids for custom data scope
-- Only used when data_scope_type = 'custom'
ALTER TABLE roles ADD COLUMN IF NOT EXISTS allowed_department_ids uuid[] DEFAULT '{}';

-- Migrate existing data based on current data_scope values
UPDATE roles SET data_scope_type = 
  CASE 
    WHEN data_scope = 'すべてのデータ権限' THEN 'all'
    WHEN data_scope = 'カスタムデータ権限' THEN 'custom'
    ELSE 'all'
  END;

-- Add check constraint for valid data_scope_type values
ALTER TABLE roles ADD CONSTRAINT check_data_scope_type 
  CHECK (data_scope_type IN ('all', 'self_and_descendants', 'self_only', 'custom'));

-- Add index for performance when querying by data_scope_type
CREATE INDEX IF NOT EXISTS idx_roles_data_scope_type ON roles(data_scope_type);

-- Comment for documentation
COMMENT ON COLUMN roles.data_scope_type IS 'Data access scope type: all (全データ), self_and_descendants (所属部署と下位), self_only (所属部署のみ), custom (カスタム)';
COMMENT ON COLUMN roles.allowed_department_ids IS 'List of department UUIDs for custom data scope. Only used when data_scope_type = custom';
