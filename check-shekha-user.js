// Script to check shekha user and test login
// Run: node check-shekha-user.js

const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from environment or config
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  console.log('Checking user salem.mfurjani@gmail.com...\n');

  // Check user
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, email, role, password_hash')
    .eq('email', 'salem.mfurjani@gmail.com');

  if (userError) {
    console.error('Error fetching user:', userError);
    return;
  }

  console.log('User data:', JSON.stringify(users, null, 2));

  if (users && users.length > 0) {
    const user = users[0];
    console.log('\n--- Analysis ---');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Password hash present:', !!user.password_hash);
    console.log('Password hash length:', user.password_hash ? user.password_hash.length : 0);

    if (!user.password_hash || user.password_hash.length < 10) {
      console.log('\n⚠️ PROBLEM: Password hash is missing or invalid!');
      console.log('This is why login is failing.');
      console.log('\nSolution: Need to reset password or recreate account.');
    } else {
      console.log('\n✓ Password hash looks valid.');
      console.log('If login still fails, check:');
      console.log('1. Backend logs for password comparison errors');
      console.log('2. Supabase Auth table vs users table sync');
    }
  } else {
    console.log('\nUser NOT FOUND in database!');
  }

  // Also check stores
  const { data: stores, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', 'shekha');

  console.log('\n--- Stores ---');
  console.log('Shekha store:', JSON.stringify(stores, null, 2));
}

checkUser().catch(console.error);
