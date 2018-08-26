var Game = require('./../share/game.js');
var Fruit = require('./../share/fruit.js');
var gameEvents = require('./../share/events.js');
var BLOCK_WIDTH = 16;
var BLOCK_HEIGHT = 16;

var Room = function(fps, worldWidth, worldHeight) {
  this.players = [];
  this.fruits = [];
  this.fruitColor = '#c00';
  this.fruitDelay = 1500;
  this.lastFruit = 0;
  this.fruitDelta = 0;
  var self = this;

  game = new Game(fps);

  game.onUpdate = function(delta) {
    var now = process.hrtime()[1];
    if (self.fruits.length < 1) {
      self.fruitDelta = now - self.lastFruit;

      console.log("lastFruit", self.lastFruit, 
        "fruitDelay", self.fruitDelay, 
        "fruitDelta", self.fruitDelta);
        
      if (self.fruitDelta >= self.fruitDelay) {
        console.log("Generating a new fruit");
        var position = {
          x: parseInt(Math.random() * worldWidth, 10),
          y: parseInt(Math.random() * worldHeight, 10),
        };

        self.addFruit(position);
        self.players.map(function(player) {
          console.log("Notifying players about the new fruit generated on position(x: " + position.x + "; y: " + position.y + ")");
          console.log('Event: ', gameEvents.client_newFruit);
          player.socket.emit(gameEvents.client_newFruit, position);
        });
      }
    }

    self.lastFruit = now;
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

Room.prototype.addFruit = function(position) {
  this.fruits[0] = new Fruit(
    this.fruitColor,
    parseInt(position.x / BLOCK_WIDTH, 10),
    parseInt(position.y / BLOCK_HEIGHT, 10),
    1,
    1
  );
};

module.exports = Room;
