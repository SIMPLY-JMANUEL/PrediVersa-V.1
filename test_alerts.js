// No require

async function test() {
  try {
    const res = await fetch('https://jkwpuacezq.us-east-1.awsapprunner.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@prediversa.com', password: 'admin123' })
    });
    
    if (res.status === 401) {
      console.log('❌ Login failed with 401. Credentials might be wrong.');
      const data = await res.json();
      console.log(data);
      return;
    }
    
    const data = await res.json();
    console.log('✅ Login OK.');
    const token = data.token || data.accessToken;
    
    console.log('🔍 Fetching /api/alerts...');
    const alertRes = await fetch('https://jkwpuacezq.us-east-1.awsapprunner.com/api/alerts', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    console.log(`Alerts Status: ${alertRes.status}`);
    const alertData = await alertRes.json();
    console.log(alertData);
    
  } catch (e) {
    console.error(e);
  }
}

test();
