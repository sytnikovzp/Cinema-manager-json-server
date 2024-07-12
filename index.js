const express = require('express');
const https = require('https');
const fs = require('fs');
const jsonServer = require('json-server');
const path = require('path');

const app = express();
const port = 5000;
const dbPath = path.join(__dirname, 'db.json');
console.log(`Using database file: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
  console.error('Database file not found:', dbPath);
  process.exit(1);
}

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/sytnikov.site/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/sytnikov.site/fullchain.pem'),
};

app.use('/api', (req, res, next) => {
  jsonServer.router(dbPath)(req, res, next);
});

app.use(jsonServer.defaults());

const spawn = require('child_process').spawn;
const watch = spawn('npx', ['json-server', '--watch', dbPath, '--port', port]);

watch.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

watch.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

watch.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

https.createServer(options, app).listen(port, () => {
  console.log(`JSON Server is running on https://sytnikov.site:${port}/api`);
});
