// Test existing customer login and session
const http = require('http');

function post(path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Content-Length': dataStr.length,
      ...headers
    };

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: defaultHeaders
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

async function test() {
  try {
    console.log('=== CUSTOMER LOGIN & SESSION TEST ===\n');

    // Step 1: Login with existing customer
    console.log('Step 1: Login with customer account...');
    const loginRes = await post('/api/auth/login', {
      email: 'testcustomer@example.com',
      password: 'TestPassword123'
    });
    
    console.log(`Status: ${loginRes.statusCode}`);
    const loginBody = JSON.parse(loginRes.body);
    console.log(`Message: ${loginBody.message || loginBody.error}`);
    
    const sessionCookie = loginRes.headers['set-cookie'];
    if (!sessionCookie) {
      console.log('❌ No session cookie set!');
      return;
    }
    
    const cookieValue = sessionCookie[0];
    console.log(`✅ Session Cookie Set`);
    console.log(`   ${cookieValue.substring(0, 100)}...\n`);
    
    // Step 2: Verify session immediately
    console.log('Step 2: Verify session with /api/auth/me...');
    const meRes1 = await post('/api/auth/me', '', {
      'Cookie': cookieValue
    });
    
    console.log(`Status: ${meRes1.statusCode}`);
    const meBody1 = JSON.parse(meRes1.body);
    if (meRes1.statusCode === 200) {
      console.log(`✅ Session Valid`);
      console.log(`   User: ${meBody1.user.name} (${meBody1.user.email})`);
      console.log(`   Role: ${meBody1.user.role}`);
      console.log(`   Session created at: ${new Date(meBody1.user.iat * 1000).toISOString()}\n`);
    } else {
      console.log(`❌ Session invalid: ${meBody1.error}`);
      return;
    }
    
    // Step 3: Simulate page refresh (same cookie)
    console.log('Step 3: Simulate page refresh (same cookie)...');
    await new Promise(r => setTimeout(r, 1000));
    
    const meRes2 = await post('/api/auth/me', '', {
      'Cookie': cookieValue
    });
    
    console.log(`Status: ${meRes2.statusCode}`);
    const meBody2 = JSON.parse(meRes2.body);
    if (meRes2.statusCode === 200) {
      console.log(`✅ Session persisted after refresh`);
      console.log(`   User still logged in: ${meBody2.user.email}\n`);
    } else {
      console.log(`❌ Session lost: ${meBody2.error}\n`);
      return;
    }
    
    // Step 4: Check if session cookie was refreshed (check for Set-Cookie header)
    console.log('Step 4: Check for sliding session refresh...');
    if (meRes2.headers['set-cookie']) {
      console.log(`✅ Session token was refreshed (sliding refresh working)`);
      console.log(`   New cookie issued by server`);
    } else {
      console.log(`ℹ️  No new cookie issued (token may be recent or not yet due for refresh)`);
    }
    console.log(`   (Tokens only refresh if older than 5 minutes)\n`);
    
    console.log('=== TEST SUMMARY ===');
    console.log('✅ Customer login: SUCCESS');
    console.log('✅ Session cookie created: SUCCESS');
    console.log('✅ Session persists on refresh: SUCCESS');
    console.log('✅ /api/auth/me returns user: SUCCESS');
    console.log('\nℹ️  Sliding session refresh:');
    console.log('   - Tokens expire in 30 minutes');
    console.log('   - Tokens are refreshed if older than 5 minutes');
    console.log('   - To test: make a request after 5 minutes of inactivity');
    console.log('   - The Set-Cookie header will appear to issue a new token');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
