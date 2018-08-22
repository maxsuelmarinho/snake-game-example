var Game = require('./../share/game.js');

var Room = function(fps) {
  this.players = [];

  game = new Game(fps);

  game.onUpdate = function(delta) {

  };
};

Room.prototype.start = function() {
  console.log('Room:start');
  game.start();
};

Room.prototype.join = function(playerId, socket) {
  if (this.players.indexOf(playerId) < 0) {
    this.players.push({
      playerId: playerId,
      socket: socket
    });
  }
};

module.exports = Room;
