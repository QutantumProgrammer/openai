import session from 'express-session';
import { app } from './app.js';

const sessionSecret = 'cyrus-openai';

export const sessionParser = session({
  saveUninitialized: false,
  secret: sessionSecret,
  resave: false,
});

app.use(sessionParser);
