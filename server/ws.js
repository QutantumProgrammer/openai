import { WebSocketServer } from 'ws';
import { send } from './openai.js';
import { server } from './app.js';
import { sessionParser } from './session.js';

export const wsMap = new Map();
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
      console.log('connected');
      wss.emit('connection', ws, request);
    });
  });
});

function onSocketError(err) {
  console.error(err);
}

const wss = new WebSocketServer({
  clientTracking: false,
  noServer: true,
});

wss.on('connection', function (ws, request) {
  const userId = request.session.userId;

  wsMap.set(userId, ws);

  ws.on('error', console.error);

  ws.on('message', async function (message) {
    try {
      console.log('ws.js: ', message.toString())
      const doneMarkStr = await send(JSON.parse(message.toString()), (data) => {
        ws.send(data);
      });
      ws.send(doneMarkStr);
    } catch (err) {
      console.log('error:', err);
      ws.send('[>_START]');
      ws.send('system error');
      ws.send('[DONE_<]');
    }
  });

  ws.on('close', function () {
    wsMap.delete(userId);
  });
});
