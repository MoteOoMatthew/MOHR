const https = require('https');
const http = require('http');

// Test endpoints
const endpoints = [
  { name: 'Local Health', url: 'http://localhost:5000/api/health' },
  { name: 'Local Auth Test', url: 'http://localhost:5000/api/auth/test' },
  { name: 'Deployed Health', url: 'https://mohr-hr-v2.onrender.com/api/health' },
  { name: 'Deployed Auth Test', url: 'https://mohr-hr-v2.onrender.com/api/auth/test' }
];

// Test login credentials
const loginCredentials = {
  username: 'admin',
  password: 'admin123'
};

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const isHttps = endpoint.url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(endpoint.url, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          name: endpoint.name,
          status: res.statusCode,
          response: data.substring(0, 200) // Limit response length
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        name: endpoint.name,
        status: 'ERROR',
        response: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        status: 'TIMEOUT',
        response: 'Request timed out'
      });
    });
    
    req.end();
  });
}

async function testLogin(baseUrl) {
  return new Promise((resolve) => {
    const loginUrl = `${baseUrl}/api/auth/login`;
    const postData = JSON.stringify(loginCredentials);
    const isHttps = loginUrl.startsWith('https');
    const client = isHttps ? https : http;
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = client.request(loginUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          name: `Login Test (${baseUrl})`,
          status: res.statusCode,
          response: data.substring(0, 200)
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        name: `Login Test (${baseUrl})`,
        status: 'ERROR',
        response: error.message
      });
    });
    
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 MOHR HR System - Authentication Tests');
  console.log('==========================================');
  
  // Test basic endpoints
  console.log('\n📡 Testing API Endpoints:');
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    const statusIcon = result.status === 200 ? '✅' : result.status === 'ERROR' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${result.name}: ${result.status}`);
    if (result.response && result.status !== 200) {
      console.log(`   Response: ${result.response}`);
    }
  }
  
  // Test login functionality
  console.log('\n🔐 Testing Login Authentication:');
  const loginTests = [
    await testLogin('http://localhost:5000'),
    await testLogin('https://mohr-hr-v2.onrender.com')
  ];
  
  for (const result of loginTests) {
    const statusIcon = result.status === 200 ? '✅' : result.status === 'ERROR' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${result.name}: ${result.status}`);
    if (result.response) {
      console.log(`   Response: ${result.response}`);
    }
  }
  
  console.log('\n🎯 Test Summary:');
  console.log('- Local backend should be running on port 5000');
  console.log('- Deployed app should be accessible on Render');
  console.log('- Login should work with: username="admin", password="admin123"');
  console.log('- Check browser console for any JavaScript errors');
}

runTests().catch(console.error); 