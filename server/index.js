const session = require('express-session');
const express = require('express');
const http = require('http');
const uuid = require('uuid');
const {WebSocketServer} = require('ws');
const {send} = require('./openai');
const {getAudioStreamFromText} = require('./audio');
const {Blob} = require('buffer');

const PORT = 3000;
const sessionSecret = 'cyrus-openai';
const app = express();

const map = new Map();

function onSocketError(err) {
  console.error(err);
}

const sessionParser = session({
  saveUninitialized: false,
  secret: sessionSecret,
  resave: false,
});

app.use('/', express.static('pages'));
app.use('/assets', express.static('assets'));
app.use(sessionParser);

app.post('/login', function (req, res) {
  const id = uuid.v4();

  console.log(`Updating session for user ${id}`);
  req.session.userId = id;
  res.send({result: 'OK', message: 'Session updated'});
});

app.delete('/logout', function (request, response) {
  const ws = map.get(request.session.userId);

  console.log('Destroying session');
  request.session.destroy(function () {
    if (ws) ws.close();

    response.send({result: 'OK', message: 'Session destroyed'});
  });
});

app.get('/getAudio', (req, res) => {
  getAudioStreamFromText(req.query.text).then((fileArrayBuffer) => {

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': fileArrayBuffer.byteLength,
    });
    res.send(Buffer.from(fileArrayBuffer));
  });

});

const server = http.createServer(app);

const wss = new WebSocketServer({
  clientTracking: false,
  noServer: true,
});

wss.on('connection', function (ws, request) {
  const userId = request.session.userId;

  map.set(userId, ws);

  ws.on('error', console.error);

  ws.on('message', async function (message) {
    try {
      const doneMarkStr = await send(JSON.parse(message.toString()), (data) => {
        ws.send(data);
      });
      ws.send(doneMarkStr);
    } catch (err) {
      ws.send('[>_START]');
      ws.send('openai run out of money');
      ws.send('[DONE_<]');
    }
  });

  ws.on('close', function () {
    map.delete(userId);
  });
});

server.on('upgrade', function (request, socket, head) {
  socket.on('error', onSocketError);

  console.log('Parsing session from request...');

  sessionParser(request, {}, () => {
    if (!request.session.userId) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    console.log('Session is parsed!');

    socket.removeListener('error', onSocketError);

    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
