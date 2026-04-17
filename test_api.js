// fetch is global
fetch('https://jkwpuacezq.us-east-1.awsapprunner.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@prediversa.com', password: 'admin123' })
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(err => console.error(err));
