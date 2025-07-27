const https = require('https');
const http = require('http');

// Login and get auth token
async function login(baseUrl) {
  return new Promise((resolve) => {
    const loginUrl = `${baseUrl}/api/auth/login`;
    const postData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });
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
        try {
          const response = JSON.parse(data);
          resolve(response.token || null);
        } catch (e) {
          resolve(null);
        }
      });
    });
    
    req.on('error', () => resolve(null));
    req.write(postData);
    req.end();
  });
}

// Test API endpoint with authentication
async function testAuthenticatedEndpoint(url, method = 'GET', data = null, token = null) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = client.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: responseData,
          parsed: (() => {
            try { return JSON.parse(responseData); } catch (e) { return null; }
          })()
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        data: error.message,
        parsed: null
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        data: 'Request timed out',
        parsed: null
      });
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runEmployeeTests(baseUrl, envName) {
  console.log(`\n🧪 Testing ${envName} Employee Management:`);
  console.log('============================================');
  
  // Step 1: Login
  console.log('🔐 Step 1: Authenticating...');
  const token = await login(baseUrl);
  if (!token) {
    console.log('❌ Authentication failed');
    return;
  }
  console.log('✅ Authentication successful');
  
  // Step 2: Get all employees
  console.log('\n📋 Step 2: Getting all employees...');
  const employeesResult = await testAuthenticatedEndpoint(`${baseUrl}/api/employees`, 'GET', null, token);
  console.log(`   Status: ${employeesResult.status}`);
  if (employeesResult.status === 200 && employeesResult.parsed) {
    console.log(`   Found: ${employeesResult.parsed.length || 0} employees`);
    if (employeesResult.parsed.length > 0) {
      console.log(`   First employee: ${employeesResult.parsed[0].name || 'N/A'}`);
    }
  } else {
    console.log(`   Response: ${employeesResult.data.substring(0, 100)}`);
  }
  
  // Step 3: Create a test employee
  console.log('\n➕ Step 3: Creating test employee...');
  const newEmployee = {
    employee_id: 'EMP001',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    position: 'Test Position',
    department: 'Test Department',
    salary: 50000,
    hire_date: '2024-01-01'
  };
  
  const createResult = await testAuthenticatedEndpoint(`${baseUrl}/api/employees`, 'POST', newEmployee, token);
  console.log(`   Status: ${createResult.status}`);
  if (createResult.status === 201 && createResult.parsed) {
    console.log(`   Created employee ID: ${createResult.parsed.id || 'N/A'}`);
  } else {
    console.log(`   Response: ${createResult.data.substring(0, 100)}`);
  }
  
  // Step 4: Get employees again to verify creation
  console.log('\n🔄 Step 4: Verifying employee creation...');
  const updatedEmployeesResult = await testAuthenticatedEndpoint(`${baseUrl}/api/employees`, 'GET', null, token);
  console.log(`   Status: ${updatedEmployeesResult.status}`);
  if (updatedEmployeesResult.status === 200 && updatedEmployeesResult.parsed) {
    const newCount = updatedEmployeesResult.parsed.length || 0;
    console.log(`   Total employees now: ${newCount}`);
  }
}

async function runAllTests() {
  console.log('🧪 MOHR HR System - Employee Management Tests');
  console.log('==============================================');
  
  // Test both local and deployed
  await runEmployeeTests('http://localhost:5000', 'LOCAL');
  await runEmployeeTests('https://mohr-hr-v2.onrender.com', 'DEPLOYED');
  
  console.log('\n🎯 Test Summary:');
  console.log('- Employee listing should work with authentication');
  console.log('- Employee creation should work with valid data');
  console.log('- Check if employees are persisted between requests');
  console.log('- Verify proper error handling for unauthorized requests');
}

runAllTests().catch(console.error); 