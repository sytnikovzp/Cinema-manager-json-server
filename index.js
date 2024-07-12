const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const jsonServer = require('json-server');
const path = require('path');
const chokidar = require('chokidar');  

const app = express();
app.use(cors());
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

const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

app.use(middlewares);
app.use('/api', router);

const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`JSON Server is running on https://sytnikov.site:${port}/api`);
});

const watcher = chokidar.watch(dbPath);

watcher.on('change', () => {
  console.log('db.json has been updated.');
  router.db = router.router(dbPath).db;
});
