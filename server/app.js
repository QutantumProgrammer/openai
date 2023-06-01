const http = require('node:http');
const express = require('express');

const PORT = 3000;

const app = express();

const server = http.createServer(app);

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });
}

module.exports = {
  app,
  server,
  startServer,
}
