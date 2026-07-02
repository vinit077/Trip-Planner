const PORT = process.env.PORT || 5000;
const API_URL = `http://localhost:${PORT}/api`;

const testUser = {
  name: 'Verification Bot',
  email: `verify-bot-${Date.now()}@example.com`,
  password: 'verification-password-123'
};

async function runTests() {
  console.log('--- Starting API Verification Tests ---');

  try {
    // 1. Status Check
    console.log('\n[1/5] Checking API status...');
    const statusRes = await fetch(`${API_URL}/status`);
    const statusData = await statusRes.json();
    if (!statusRes.ok || !statusData.success) {
      throw new Error(`API Status inactive: ${JSON.stringify(statusData)}`);
    }
    console.log('✅ API is active and running.');

    // 2. User Registration
    console.log(`\n[2/5] Registering verification user (${testUser.email})...`);
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const regData = await regRes.json();
    if (!regRes.ok || !regData.success) {
      throw new Error(`User registration failed: ${JSON.stringify(regData)}`);
    }
    console.log('✅ Registration successful. Received JWT token.');
    const token = regData.token;

    // 3. User Login
    console.log('\n[3/5] Authenticating registered user...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) {
      throw new Error(`User login failed: ${JSON.stringify(loginData)}`);
    }
    console.log('✅ Authentication successful.');

    // 4. Auth Middleware Route Access (Me)
    console.log('\n[4/5] Testing protected /auth/me route with JWT...');
    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meData = await meRes.json();
    if (!meRes.ok || !meData.success) {
      throw new Error(`Protected route access failed: ${JSON.stringify(meData)}`);
    }
    console.log(`✅ Protected route accessible. Logged in as: ${meData.user.name}`);

    // 5. Explore Destinations
    console.log('\n[5/5] Fetching destinations explorer list...');
    const destRes = await fetch(`${API_URL}/destinations`);
    const destData = await destRes.json();
    if (!destRes.ok || !destData.success) {
      throw new Error(`Fetching destinations failed: ${JSON.stringify(destData)}`);
    }
    console.log(`✅ Fetching destinations successful. Found ${destData.count} destinations.`);
    destData.destinations.forEach(dest => {
      console.log(`   - ${dest.name} (${dest.category}): ${dest.location}`);
    });

    console.log('\n🎉 ALL BACKEND API VERIFICATION TESTS COMPLETED SUCCESSFULLY! 🎉');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ VERIFICATION TEST FAILED:', error.message);
    process.exit(1);
  }
}

// Start tests
runTests();
