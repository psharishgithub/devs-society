-- Fix admin constraint to allow deletion of admins and colleges
-- This script fixes the admin_college_check constraint that prevents deletion

-- Drop the existing problematic constraint
ALTER TABLE admins DROP CONSTRAINT IF EXISTS admin_college_check;

-- Create new constraint that allows deactivated admins to not have college assignments
-- This enables proper deletion while maintaining data integrity
ALTER TABLE admins ADD CONSTRAINT admin_college_check CHECK (
    (role = 'super-admin' AND assigned_college_id IS NULL) OR 
    (role = 'admin' AND (assigned_college_id IS NOT NULL OR is_active = false))
);

-- Make tenure fields optional for better flexibility
ALTER TABLE admins ALTER COLUMN tenure_start_date DROP NOT NULL;
ALTER TABLE admins ALTER COLUMN tenure_is_active SET DEFAULT false;

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT admin_college_check ON admins IS 'Allows super-admins to not have college assignments and regular admins to be deactivated without college assignments'; 