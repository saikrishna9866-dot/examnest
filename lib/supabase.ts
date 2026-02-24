
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uxuuqkvkpmrqdssajnia.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4dXVxa3ZrcG1ycWRzc2FqbmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTMyNjYsImV4cCI6MjA4Njc4OTI2Nn0.U8v3cyp3UTdNOBMclJHM7ZLXZUiy7cHVOyIZo2hub_c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
