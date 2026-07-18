-- Seed admin user profile
-- Run: supabase db push

INSERT INTO profiles (id, email, full_name, role, account_id)
SELECT id, 'carter@trustednetworx.com', 'Carter Dewey', 'admin', '00000000-0000-0000-0000-000000000001'
FROM auth.users
WHERE email = 'carter@trustednetworx.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', account_id = '00000000-0000-0000-0000-000000000001';
