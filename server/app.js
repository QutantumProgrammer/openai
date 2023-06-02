import http from 'node:http';
import express from 'express';

export const PORT = 3000;

export const app = express();

export const server = http.createServer(app);

export const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });
}
