var debug = require('debug')('docker-stream');
var io = require('socket.io');
var express = require('express');
var path = require('path');
var config = require('./lib/config');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var Redis = require('redis');
var sub = Redis.createClient(config.redis.port, config.redis.host, config.redis.options);
var bodyParser = require('body-parser');

var app = express(),
socket;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.render('index', {
    'title': 'Kitties!'
  });
});

sub.subscribe('images');
sub.on('message', function (channel, message) {
  console.log(message);
  socket.emit('image', 'https://kittystore.blob.core.windows.net/kittycontainer/' + message);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var server = require('http').createServer(app).listen(3000);
socket = io.listen(server);
