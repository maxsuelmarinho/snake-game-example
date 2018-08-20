var Room = require('./room.js');

var rooms = [];

module.exports = {
  newRoom: function() {
    var room = new Room();
    rooms.push(room);
    return rooms.length - 1;
  },
  joinRoom: function(roomId, socket, playerId) {
    console.log('Player:', playerId, 'joined room:', roomId);
    var room = rooms[roomId];
    room.join(playerId, socket);
  }
};
