const http = require('http');

/**
 * Discover backend port by trying common ports
 * Backend uses ports 3003-3012
 */
async function discoverBackendPort() {
  const possiblePorts = [3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012];
  
  for (const port of possiblePorts) {
    try {
      const isAlive = await checkPort(port);
      if (isAlive) {
        console.log(`✓ Backend discovered on port ${port}`);
        return port;
      }
    } catch (err) {
      // Port not responding, try next
    }
  }
  
  console.warn('⚠ Backend not found on any expected port (3003-3012)');
  console.warn('  Please start backend: cd backend/modules/03-CRM && npm run start:dev');
  return 3003; // Default fallback
}

/**
 * Check if backend is running on a specific port
 */
function checkPort(port) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 500,
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404); // 404 means server is running
    });

    req.on('error', () => {
      reject(false);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(false);
    });

    req.end();
  });
}

module.exports = { discoverBackendPort };
