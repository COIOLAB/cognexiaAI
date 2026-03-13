const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { discoverBackendPort } = require('./lib/discover-backend');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';

// Dynamic port allocation - try ports from 3001 to 3010
async function findAvailablePort(startPort = 3001, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    try {
      await new Promise((resolve, reject) => {
        const testServer = createServer();
        testServer.once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            testServer.close();
            reject(err);
          }
        });
        testServer.once('listening', () => {
          testServer.close();
          resolve();
        });
        testServer.listen(port);
      });
      return port;
    } catch (err) {
      if (i === maxAttempts - 1) {
        throw new Error(`No available ports found between ${startPort} and ${startPort + maxAttempts - 1}`);
      }
    }
  }
}

async function startServer() {
  try {
    // Discover backend port first
    console.log('\x1b[90m%s\x1b[0m', '🔍 Discovering backend...');
    const backendPort = await discoverBackendPort();
    
    // Set environment variable for Next.js
    process.env.NEXT_PUBLIC_API_URL = `http://localhost:${backendPort}/api/v1`;
    
    // Initialize Next.js app with discovered backend
    const app = next({ dev, hostname });
    const handle = app.getRequestHandler();
    await app.prepare();
    
    // Use fixed port 3001 for super admin portal
    const port = 3001;
    
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    }).listen(port, (err) => {
      if (err) throw err;
      console.log('\x1b[32m%s\x1b[0m', '✓ Super Admin Portal Ready');
      console.log('\x1b[36m%s\x1b[0m', `  ➜ Frontend: http://${hostname}:${port}`);
      console.log('\x1b[36m%s\x1b[0m', `  ➜ Backend:  http://${hostname}:${backendPort}`);
      console.log('\x1b[90m%s\x1b[0m', '  ➜ Press Ctrl+C to stop');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
