import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovhcnmztvbldfeywaxlo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92aGNubXp0dmJsZGZleXdheGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjI1NjQsImV4cCI6MjA5MTgzODU2NH0.KD7Gi79XzL-ROp_bIwn3zk91IDvTEgM1WoRBtJm2D1U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Registering admin user...');
  const { data, error } = await supabase.auth.signUp({
    email: 'rushil.reddy4726@gmail.com',
    password: '123456',
    options: {
      data: {
        role: 'admin',
        full_name: 'Rushil Reddy'
      }
    }
  });

  if (error) {
    if (error.status === 422 && error.message.includes('User already registered')) {
        console.log('User already exists. Updating their status might require admin privileges/dashboard.');
    } else {
        console.error('Error signing up user:', error);
    }
  } else {
    console.log('Successfully registered rushil.reddy4726@gmail.com as ADMIN');
    console.log(data);
  }
}

seed();
