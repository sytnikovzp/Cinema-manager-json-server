const express = require('express');
const http = require('http');
const fs = require('fs');
const jsonServer = require('json-server');
const path = require('path');
const chokidar = require('chokidar');
const cors = require('cors');

const app = express();
const port = 5000;
const host = process.env.HOST || 'localhost';
const dbPath = path.join(__dirname, 'db.json');

if (!fs.existsSync(dbPath)) {
  console.error('Database file not found:', dbPath);
  process.exit(1);
}

const options = {};

app.use(cors());

app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.replace('/api', '');
  }
  next();
});

const reverseOrderMiddleware = (req, res, next) => {
  if (!req.query._sort) {
    req.query._sort = 'id';
  }

  if (!req.query._order) {
    req.query._order = 'desc';
  }

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

http.createServer(options, app).listen(port, host, () => {
  console.log(`JSON Server is running on http://${host}:${port}`);
});
