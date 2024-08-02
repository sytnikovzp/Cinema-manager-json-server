const express = require('express');
const https = require('https');
const fs = require('fs');
const jsonServer = require('json-server');
const path = require('path');
const chokidar = require('chokidar');
const cors = require('cors');

const app = express();
const port = 5000;
const host = process.env.HOST || 'sytnikov.site';
const dbPath = path.join(__dirname, 'db.json');

if (!fs.existsSync(dbPath)) {
  console.error('Database file not found:', dbPath);
  process.exit(1);
}

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/sytnikov.site/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/sytnikov.site/fullchain.pem'),
};

app.use(cors());

app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.replace('/api', '');
  }
  next();
});

const reverseOrderMiddleware = (req, res, next) => {
  const originalSend = res.send.bind(res);

  res.send = (body) => {
    if (body && typeof body === 'string') {
      const data = JSON.parse(body);

      if (Array.isArray(data)) {
        data.reverse();
      }

      originalSend(JSON.stringify(data));
    } else {
      originalSend(body);
    }
  };

  next();
};

const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

app.use(middlewares);
app.use(reverseOrderMiddleware);
app.use(router);

const watcher = chokidar.watch(dbPath);
watcher.on('change', () => {
  console.log('db.json has been updated. Reloading data...');
  const newData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  router.db.setState(newData);
});

app.use((req, res, next) => {
  res.redirect('/');
});

https.createServer(options, app).listen(port, host, () => {
  console.log(`JSON Server is running on https://${host}:${port}`);
});
