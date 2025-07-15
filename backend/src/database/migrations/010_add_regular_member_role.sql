-- Migration: Add regular-member role to user_role enum
-- Date: 2025-01-15

-- Add regular-member to the user_role enum
ALTER TYPE user_role ADD VALUE 'regular-member';

-- Update any existing 'other' roles to 'regular-member' if needed
-- (This is optional - you can keep 'other' as is)
-- UPDATE users SET role = 'regular-member' WHERE role = 'other'; 