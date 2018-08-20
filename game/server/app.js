var Room = require('./room.js');

var rooms = [];

module.exports = {
  newRoom: function() {
    var room = new Room();
    rooms.push(room);
    return rooms.length - 1;
  },
};
