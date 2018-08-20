var players = [];

var Room = function() {
  this.players = players;
};

Room.prototype.join = function(playerId, socket) {
  if (players.indexOf(playerId) < 0) {
    players.push({
      playerId: playerId,
      socket: socket
    });
  }
};

module.exports = Room;
