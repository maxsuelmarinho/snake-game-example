var Room = require('./room.js');
var Snake = require('./../share/snake.js');
var gameEvents = require('./../share/events.js');

var rooms = [];
var FPS = 60;

var GameServer = function() {
};

GameServer.prototype.newRoom = function(maxWidth, maxHeight) {
  var room = new Room(FPS, maxWidth, maxHeight);
  rooms.push(room);
  return rooms.length - 1;
};

GameServer.prototype.joinRoom = function(roomId, socket, player) {
  console.log('Player:', player.id, 'joined room:', roomId);
  var room = rooms[roomId];
  var snake = new Snake(player.id, player.color, player.x, player.y, 1, 1);

  room.join(snake, socket);

  console.log('Sending event:', gameEvents.client_roomJoined);
  socket.emit(gameEvents.client_roomJoined, {
    roomId: roomId
  });
};

GameServer.prototype.listRooms = function() {
  return rooms.map(function (room, index) {
    return {
      roomId: index,
      players: room.players.map(function (player) {
        return {
          id: player.snake.id
        };
      })
    }
  });
};

GameServer.prototype.startRoom = function(roomId) {
  console.log('Server:startRoom');
  rooms[roomId].start();
};

GameServer.prototype.setPlayerKey = function(roomId, playerId, keyCode) {
  var players = rooms[roomId].getPlayers();

  var data = players.map(function(player) {
    return player.snake;
  });

  players.map(function (player) {
    if (player.snake.id == playerId) {
      player.snake.setKey(keyCode);
    }

    console.log('Sending event:', gameEvents.client_playerState);
    player.socket.emit(gameEvents.client_playerState, data);
  });
};

GameServer.prototype.connection = function(socket) {

  var self = this;
  socket.on(gameEvents.server_newRoom, function (data) {
    console.log('Event: ', gameEvents.server_newRoom);
    var roomId = self.newRoom(data.maxWidth, data.maxHeight);
    self.joinRoom(roomId, this, data.player);
  });

  socket.on(gameEvents.server_listRooms, function () {
    console.log('Event: ', gameEvents.server_listRooms);
    var rooms = self.listRooms();

    console.log('Sending event:', gameEvents.client_roomsList);
    socket.emit(gameEvents.client_roomsList, rooms);
  });

  socket.on(gameEvents.server_joinRoom, function (data) {
    console.log('Event: ', gameEvents.server_joinRoom);
    self.joinRoom(data.roomId, this, data.player);
  });

  socket.on(gameEvents.server_startRoom, function (data) {
    console.log('Event: ', gameEvents.server_startRoom);
    self.startRoom(data.roomId);
  });

  socket.on(gameEvents.server_setPlayerKey, function (data) {
    //console.log('Event: ', gameEvents.server_setPlayerKey);
    self.setPlayerKey(data.roomId, data.playerId, data.keyCode);
  });
};

module.exports = GameServer;
