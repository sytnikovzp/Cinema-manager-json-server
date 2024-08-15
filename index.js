const https = require('https');
const fs = require('fs');

// ======================================================
const app = require('./src/app');

// =========== Create server with HTTPS module ===========

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/sytnikov.site/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/sytnikov.site/fullchain.pem'),
};

const PORT = 5000;
const server = https.createServer(options, app);

server.listen(PORT, () => {
  console.log(`JSON Server is running on https://sytnikov.site:${PORT}`);
});
