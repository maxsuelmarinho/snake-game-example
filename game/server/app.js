var Room = require('./room.js');
var gameEvents = require('./../share/events.js');

var rooms = [];
var FPS = 60;

module.exports = {
  newRoom: function() {
    var room = new Room(FPS);
    rooms.push(room);
    return rooms.length - 1;
  },

  joinRoom: function(roomId, socket, playerId) {
    console.log('Player:', playerId, 'joined room:', roomId);
    var room = rooms[roomId];

    room.join(playerId, socket);

    console.log('Sending event:', gameEvents.client_roomJoined);
    socket.emit(gameEvents.client_roomJoined, {
      roomId: roomId
    });
  },

  listRooms: function() {
    return rooms.map(function(room, index) {
      return {
        roomId: index,
        players: room.players.map(function(player) {
          return {
            id: player.playerId
          };
        })
      }
    });
  },

  startRoom: function(roomId) {
    console.log('Server:startRoom');
    rooms[roomId].start();
  }
};
