import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovhcnmztvbldfeywaxlo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92aGNubXp0dmJsZGZleXdheGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjI1NjQsImV4cCI6MjA5MTgzODU2NH0.KD7Gi79XzL-ROp_bIwn3zk91IDvTEgM1WoRBtJm2D1U';

export const supabase = createClient(supabaseUrl, supabaseKey);
