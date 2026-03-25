const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'piyushshinde42161@gmail.com',
      password: process.argv[2]
    });
    console.log("LOGIN RESPONSE:");
    console.log(JSON.stringify(res.data.user, null, 2));
  } catch (err) {
    if (err.response) {
      console.log("LOGIN ERROR:", err.response.data);
    } else {
      console.log("ERROR:", err.message);
    }
  }
}

testLogin();
