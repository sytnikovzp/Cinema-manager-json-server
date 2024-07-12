const express = require('express');
const https = require('https');
const fs = require('fs');
const jsonServer = require('json-server');
const path = require('path');

const app = express();

const dbPath = path.join(__dirname, 'db.json');
console.log(`Using database file: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
  console.error('Database file not found:', dbPath);
  process.exit(1);
}

const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/sytnikov.site/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/sytnikov.site/fullchain.pem'),
};

app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.replace('/api', '');
  }
  next();
});

app.use(middlewares);
app.use('/api', router);

const port = 5000;

https.createServer(options, app).listen(port, () => {
  console.log(`JSON Server is running on https://sytnikov.site:${port}/api`);
});
