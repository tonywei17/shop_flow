-- Add badge_color column to roles table for custom role tag colors
ALTER TABLE roles ADD COLUMN IF NOT EXISTS badge_color text DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN roles.badge_color IS 'Custom color for role badge display (e.g., #10b981, #f59e0b)';
