require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const r1 = await supabase.from('inscripciones').select('id').limit(1);
  if (!r1.error) console.log("inscripciones EXISTE");
  else console.log("inscripciones ERROR: ", r1.error.message);

  const r2 = await supabase.from('enrollments').select('id').limit(1);
  if (!r2.error) console.log("enrollments EXISTE");
  else console.log("enrollments ERROR: ", r2.error.message);
}
test();
