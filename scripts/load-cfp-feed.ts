import { fetchCFPFeed } from '../src/lib/cfp.feed.service';
import { supabaseAdmin } from '../src/lib/supabaseClient';
import 'dotenv/config';

async function testConnection() {
  try {
    console.log('Debug: Testing Supabase connection...');
    console.log('Debug: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Debug: Service Role Key exists:', !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
    
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('count');
    
    if (error) {
      console.error('Connection test failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    
    console.log('Supabase connection successful', data);
    return true;
  } catch (e) {
    console.error('Connection test failed:', {
      message: e.message,
      stack: e.stack
    });
    return false;
  }
}

async function loadCFPFeed() {
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.error('Aborting due to connection failure');
    return;
  }

  console.log('🔄 Starting CFP feed load process...');

  try {
    // Fetch and process feed items
    console.log('\nFetching and processing feed items...');
    const items = await fetchCFPFeed();

    // Get count of items that were actually processed
    const { data: existingArticles, error: countError } = await supabaseAdmin
      .from('articles')
      .select('id, url, timestamp')
      .eq('category', 'CFP')
      .order('timestamp', { ascending: false });

    if (countError) {
      throw new Error(`Error fetching existing articles: ${countError.message}`);
    }

    // Calculate cleanup if needed (maintain 20 record limit)
    const totalCurrentItems = existingArticles?.length || 0;
    if (totalCurrentItems > 20) {
      const numberToDelete = totalCurrentItems - 20;
      const recordsToDelete = existingArticles!
        .slice(-numberToDelete);

      console.log(`Cleaning up ${numberToDelete} oldest records to maintain 20 record limit`);
      
      const { error: deleteError } = await supabaseAdmin
        .from('articles')
        .delete()
        .in('id', recordsToDelete.map(record => record.id));

      if (deleteError) {
        throw new Error(`Error during cleanup: ${deleteError.message}`);
      }
      console.log(`Successfully removed ${numberToDelete} old records`);
    }

    // Get final count for summary
    const { data: countData, count: finalCount } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'CFP')

    // Summary
    console.log('\n📊 Load Summary:');
    console.log(`Total Items Retrieved: ${items.length}`);
    console.log(`Final CFP Articles Count: ${finalCount}`);
    console.log('✅ Feed processing complete\n');

  } catch (error) {
    console.error('❌ Fatal error during feed load:', error);
  }
}

// Run the load process
loadCFPFeed();
