const express = require('express');
const https = require('https');
const fs = require('fs');
const jsonServer = require('json-server');
const path = require('path');

const app = express();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/sytnikov.site/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/sytnikov.site/fullchain.pem')
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
