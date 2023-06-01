const {startServer} = require('./app');

require('./httpRequest');
require('./session');
require('./static');
require('./ws');

startServer();

