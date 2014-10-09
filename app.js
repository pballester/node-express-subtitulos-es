var express = require('express'),
	path = require('path'),
	logger = require('morgan'),
	serveStatic = require('serve-static'),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	app = express(),
	tmpFolder = path.join(__dirname, 'tmp'),
	debug = require('debug')('node-express-subtitulos-es');

// creating tmp folder if not exists
if (!fs.existsSync(tmpFolder)) {
	fs.mkdir(tmpFolder);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(serveStatic(path.join(__dirname, 'public')));

//Injection of global variables
app.use(function(req, res, next) {
	res.locals.tmpFolder = tmpFolder;
	next();
});

//Router declaration
var router = require('./router');
app.use('/', router);

/// catch * and forwards to home
app.use(function(req, res, next) {
	res.redirect('/');
});

module.exports = app;