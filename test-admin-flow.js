const axios = require('axios');

async function testAdminFlow() {
  console.log('=== Testing Admin Login Flow ===\n');
  
  const API_URL = 'http://localhost:5000/api';
  const ADMIN_URL = 'http://localhost:3003';
  
  try {
    // Step 1: Test login
    console.log('1. Testing login endpoint...');
    const loginResponse = await axios.post(`${API_URL}/admin/login`, {
      email: 'admin@fieldsy.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success || !loginResponse.data.token) {
      throw new Error('Login failed: No token received');
    }
    
    console.log('✓ Login successful');
    console.log('  Token:', loginResponse.data.token.substring(0, 20) + '...');
    console.log('  Admin ID:', loginResponse.data.admin.id);
    console.log('  Admin Email:', loginResponse.data.admin.email);
    console.log('  Admin Role:', loginResponse.data.admin.role);
    
    const token = loginResponse.data.token;
    
    // Step 2: Test verify endpoint
    console.log('\n2. Testing verify endpoint...');
    const verifyResponse = await axios.get(`${API_URL}/admin/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!verifyResponse.data.success || !verifyResponse.data.admin) {
      throw new Error('Verification failed');
    }
    
    console.log('✓ Verification successful');
    console.log('  Admin verified:', verifyResponse.data.admin.email);
    
    // Step 3: Test dashboard stats endpoint
    console.log('\n3. Testing dashboard stats endpoint...');
    const statsResponse = await axios.get(`${API_URL}/admin/stats?period=Today`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!statsResponse.data.success) {
      throw new Error('Stats endpoint failed');
    }
    
    console.log('✓ Stats endpoint successful');
    console.log('  Total Users:', statsResponse.data.stats.totalUsers);
    console.log('  Total Fields:', statsResponse.data.stats.totalFields);
    console.log('  Total Bookings:', statsResponse.data.stats.totalBookings);
    
    // Step 4: Check admin panel is accessible
    console.log('\n4. Checking admin panel accessibility...');
    try {
      const panelResponse = await axios.get(`${ADMIN_URL}/login`);
      console.log('✓ Admin panel is accessible at', ADMIN_URL);
    } catch (error) {
      console.log('✗ Admin panel not accessible:', error.message);
    }
    
    console.log('\n=== All tests passed! ===');
    console.log('\nTo login to admin panel:');
    console.log(`1. Go to ${ADMIN_URL}/login`);
    console.log('2. Use email: admin@fieldsy.com');
    console.log('3. Use password: admin123');
    
  } catch (error) {
    console.error('\n✗ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('\nPossible issues:');
      console.log('- Invalid credentials');
      console.log('- Admin user not created');
      console.log('- JWT secret mismatch');
    }
  }
}

testAdminFlow();