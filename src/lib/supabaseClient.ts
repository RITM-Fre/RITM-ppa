import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://kydrkdyxfcavsfkinusp.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZHJrZHl4ZmNhdnNma2ludXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTc5NTgsImV4cCI6MjEwNjE3Mzk1OH0.vP7tGqH8_xR2-dF3ZtP_sZk4o-V-V48t2y4s3i4o9Qc';
export const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZHJrZHl4ZmNhdnNma2ludXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDU5Nzk1OCwiZXhwIjoyMTA2MTczOTU4fQ.EJLK_9jKeX9sXogTgZSJbZn6yfoxRTUkKLidlo5QFYY';

// Create browser Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
