// Test script to check Supabase data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gioocsxzhcfvogjgzeqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpb29jc3h6aGNmdm9namd6ZXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0ODExNjYsImV4cCI6MjA4NzA1NzE2Nn0.mJj312NsZcj_6rpJ4Nb1nu_1ZbOoVhaZvhhJLWuZQlM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseData() {
  console.log('🔍 Checking Supabase connection and tables...\n');

  // Test 1: Check if app_data table exists
  console.log('Test 1: Checking app_data table...');
  const { data: tableCheck, error: tableError } = await supabase
    .from('app_data')
    .select('*')
    .limit(1);

  if (tableError) {
    console.log('❌ Table app_data does not exist!');
    console.log('   Error:', tableError.message);
    console.log('\n⚠️  SOLUTION: Run the SQL in supabase-setup.sql in Supabase SQL Editor');
    console.log('   1. Go to: https://supabase.com/dashboard/project/gioocsxzhcfvogjgzeqh/sql/new');
    console.log('   2. Copy content from supabase-setup.sql');
    console.log('   3. Run the SQL');
    return;
  }

  console.log('✅ Table app_data exists!\n');

  // Test 2: Check data for each type
  console.log('Test 2: Checking data in each category...\n');
  const dataTypes = ['daily_reports', 'warehouse', 'sales', 'operational', 'finance', 'feed_formulas'];

  for (const type of dataTypes) {
    const { data, error } = await supabase
      .from('app_data')
      .select('data, updated_at')
      .eq('user_id', 'default')
      .eq('data_type', type)
      .single();

    if (error) {
      console.log(`❌ ${type}: No data (${error.message})`);
    } else {
      const count = Array.isArray(data.data) ? data.data.length : 0;
      const lastUpdate = new Date(data.updated_at).toLocaleString('id-ID');
      console.log(`✅ ${type}: ${count} records (updated: ${lastUpdate})`);
      
      if (count > 0) {
        const sample = data.data[data.data.length - 1]; // Show latest record
        console.log(`   Latest record:`, JSON.stringify(sample).substring(0, 150) + '...');
      }
    }
  }
  
  console.log('\n✅ Test completed!');
}

testSupabaseData().catch(console.error);
