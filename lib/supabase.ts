
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://llvihwwmetkqvfxwfbbm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsdmlod3dtZXRrcXZmeHdmYmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDAzNDUsImV4cCI6MjA4NzUxNjM0NX0.syzxiCE6BEchvv9NxK9PtrIVz_J-BOQe1ZPsXUHQyVM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
