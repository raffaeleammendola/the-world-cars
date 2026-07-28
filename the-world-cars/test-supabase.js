const supabaseUrl = "https://fhmaymnnpwhykxnjrxcv.supabase.co";
const supabaseKey = "sb_publishable_9vbpBotMN8SbWkLf9A97cQ_7gv6BvhN";

async function testSupabase() {
  console.log("Testing Supabase GET...");
  const res = await fetch(`${supabaseUrl}/rest/v1/auto`, { 
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}

testSupabase();
