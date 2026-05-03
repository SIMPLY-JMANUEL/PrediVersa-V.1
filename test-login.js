const fetch = require('node-fetch') || fetch;

async function testLogin() {
  try {
    const res = await fetch('https://jkwpuacezq.us-east-1.awsapprunner.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'estudiante@prediversa.com', password: 'Estudiante2026*' })
    });
    
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testLogin();
