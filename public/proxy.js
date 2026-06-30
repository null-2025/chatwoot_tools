const http = require('http');
const https = require('https');

// Parse CLI arguments
const args = process.argv.slice(2);
let accountId = '';
let accessToken = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--id') accountId = args[i + 1];
  if (args[i] === '--access-token') accessToken = args[i + 1];
}

if (!accountId || !accessToken) {
  console.error("Error: Missing required arguments.");
  console.error("Usage: <runner> - --id <account_id> --access-token <token>");
  process.exit(1);
}

const PORT = 8765;

const server = http.createServer((req, res) => {
  // Add CORS headers for the frontend to communicate with this proxy
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, api_access_token');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Health check / status endpoint
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'connected', accountId }));
  }

  // Forward everything else to app.chatwoot.com
  const options = {
    hostname: 'app.chatwoot.com',
    port: 443,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'app.chatwoot.com',
      'api_access_token': accessToken
    }
  };

  // Remove headers that could break the request when changing hosts
  delete options.headers.origin;
  delete options.headers.referer;

  const proxyReq = https.request(options, (proxyRes) => {
    // Copy the response headers and status code back to the client
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy Error:', err);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end('Internal Proxy Error');
    }
  });

  // Pipe the incoming request body to the outgoing proxy request
  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log(`[Chatwoot Local Proxy] Running on http://localhost:${PORT}`);
  console.log(`[Chatwoot Local Proxy] Account ID: ${accountId}`);
  console.log(`[Chatwoot Local Proxy] Ready to accept requests from the web app.`);
});
