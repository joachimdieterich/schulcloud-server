'use strict';

const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const middleware = require('./middleware');
const services = require('./services');
const setupEnvironment = require('./setupEnvironment');
const winston = require('winston');
const defaultHeaders = require('./middleware/defaultHeaders');

const app = feathers();

app.configure(configuration(path.join(__dirname, '..')));

app.use(compress())
	.options('*', cors())
	.use(cors())
	.use(favicon(path.join(app.get('public'), 'favicon.ico')))
	.use('/', serveStatic(app.get('public')))
	.use(bodyParser.json())
	.use(bodyParser.urlencoded({extended: true}))
	.use(defaultHeaders)
	.configure(hooks())
	.configure(rest())
	.configure(socketio())
	.configure(services)
	.configure(middleware);

winston.cli();	// optimize for cli, like using colors
winston.level = 'debug';
winston.info('test');
setupEnvironment(app);

module.exports = app;