
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygylsbivacokhooqzsqe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlneWxzYml2YWNva2hvb3F6c3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTA2OTEsImV4cCI6MjA4Njg2NjY5MX0.O7nU_fgGK_nf2nqtJSiVi8DkeI9rdBqf33FwxL10pbM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
