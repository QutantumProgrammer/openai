const {getAudioStreamFromText} = require('./audio');
const uuid = require('uuid');
const {app} = require('./app');
const {wsMap} = require('./ws');
app.post('/login', function (req, res) {
  const id = uuid.v4();

  console.log(`Updating session for user ${id}`);
  req.session.userId = id;
  res.send({result: 'OK', message: 'Session updated'});
});

app.delete('/logout', function (request, response) {
  const ws = wsMap.get(request.session.userId);

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
