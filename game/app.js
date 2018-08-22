var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var io = require('socket.io')();

var gameEvents = require('./share/events.js');
var game = require('./server/app.js');

var app = express();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.on('connection', function(socket) {
  console.log("new client connection");

  socket.on(gameEvents.server_newRoom, function(data) {
    console.log('Event: ', gameEvents.server_newRoom);
    var roomId = game.newRoom();
    game.joinRoom(roomId, this, data.id);
  });

  socket.on(gameEvents.server_listRooms, function() {
    console.log('Event: ', gameEvents.server_listRooms);
    var rooms = game.listRooms();

    console.log('Sending event:', gameEvents.client_roomsList);
    socket.emit(gameEvents.client_roomsList, rooms);
  });

  socket.on(gameEvents.server_joinRoom, function(data) {
    console.log('Event: ', gameEvents.server_joinRoom);
    game.joinRoom(data.roomId, this, data.id);
  });

  socket.on(gameEvents.server_startRoom, function(data) {
    console.log('Event: ', gameEvents.server_startRoom);
    game.startRoom(data.roomId);
  });
});

module.exports = app;
