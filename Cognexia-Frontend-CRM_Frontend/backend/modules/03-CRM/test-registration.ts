import axios from 'axios';

const API_URL = 'http://localhost:3003';

async function testRegistration() {
  try {
    console.log('🧪 Testing Registration Endpoint...\n');

    const registerData = {
      email: 'test@example.com',
      password: 'Test@12345',
      firstName: 'Test',
      lastName: 'User',
      companyName: 'Test Company Inc',
      phone: '1234567890',
      industry: 'Technology',
      companySize: '1-10',
    };

    console.log('📤 Sending registration request...');
    console.log('Data:', JSON.stringify(registerData, null, 2));

    const response = await axios.post(`${API_URL}/auth/register`, registerData);

    console.log('\n✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('\n❌ Registration failed!');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Is the backend running on port 3003?');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();
