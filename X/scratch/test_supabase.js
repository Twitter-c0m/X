// Test Supabase integration
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gcgvocfvxjhgahykqfln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZ3ZvY2Z2eGpoZ2FoeWtxZmxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NjMyODEsImV4cCI6MjEwNTAzOTI4MX0.cU48vfKXbIkaGsHS5F91Sz26nXraSWD3X7iGZDHEGXI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  // Insert a test user
  const testUser = { username: 'test_user_' + Date.now(), password: 'test_pass' };
  const { data: insertData, error: insertError } = await supabase.from('users').insert([testUser]).select();
  if (insertError) {
    console.error('Insert error:', insertError);
    process.exit(1);
  }
  console.log('Inserted:', insertData);

  // Fetch recent users (limit 5)
  const { data: fetchData, error: fetchError } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5);
  if (fetchError) {
    console.error('Fetch error:', fetchError);
    process.exit(1);
  }
  console.log('Recent users:', fetchData);
})();
