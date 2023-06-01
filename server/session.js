const session = require('express-session');
const {app} = require('./app');

const sessionSecret = 'cyrus-openai';

const sessionParser = session({
  saveUninitialized: false,
  secret: sessionSecret,
  resave: false,
});

app.use(sessionParser);

module.exports.sessionParser = sessionParser; 
