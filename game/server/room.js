var Game = require('./../share/game.js');
var Fruit = require('./../share/fruit.js');
var gameEvents = require('./../share/events.js');
var BLOCK_WIDTH = 16;
var BLOCK_HEIGHT = 16;

var Room = function(id, fps, worldWidth, worldHeight) {
  this.id = id;
  this.worldWidth = worldWidth;
  this.worldHeight = worldHeight;
  this.players = [];
  this.fruits = [];
  this.fruitColor = '#c00';
  this.fruitDelay = 1500;
  this.lastFruit = 0;
  this.fruitDelta = 0;
  
  this.game = new Game(fps);
  this.gameUpdateRate = 1;
  this.gameUpdates = 0;
  this.updateCount = 0;
  
  var self = this;

  this.game.onUpdate = function(delta) {
    self.updateCount++;
    //console.log("updateCount", self.updateCount);
    self.generateFruit(worldWidth, worldHeight);

    self.players.map(function(player) {
      var snake = player.snake;
      snake.update(delta);
      snake.checkCollision();

      if (snake.head.x < 0) {
        snake.head.x = worldWidth;
      }

      if (snake.head.x > worldWidth) {
        snake.head.x = 0;
      }

      if (snake.head.y < 0) {
        snake.head.y = worldHeight;
      }

      if (snake.head.y > worldHeight) {
        snake.head.y = 0;
      }

      self.checkFruitCollision(snake);
    });

    if (++self.gameUpdates % self.gameUpdateRate === 0) {
      self.gameUpdates = 0;
      var data = self.players.map(function(player) {
        return player.snake;
      });

      self.players.map(function(player) {
        //console.log('Sending event:', gameEvents.client_playerState);
        player.socket.emit(gameEvents.client_playerState, data);
      });
    }
  };
};

Room.prototype.start = function() {
  console.log('Room:start');
  this.game.start();
};

Room.prototype.join = function(snake, socket) {
  if (this.players.indexOf(snake.id) < 0) {
    this.players.push({
      snake: snake,
      socket: socket
    });
  }
};

Room.prototype.generateFruit = function (worldWidth, worldHeight) {
  var now = process.hrtime()[1];

  if (this.fruits.length < 1) {
    this.fruitDelta = now - this.lastFruit;

    console.log("lastFruit", this.lastFruit,
      "fruitDelay", this.fruitDelay,
      "fruitDelta", this.fruitDelta);

    if (this.fruitDelta >= this.fruitDelay) {
      console.log("Generating a new fruit");
      var position = {
        x: parseInt(Math.random() * worldWidth, 10),
        y: parseInt(Math.random() * worldHeight, 10),
      };

      this.addFruit(position);
      this.players.map(function (player) {
        console.log("Notifying players about the new fruit generated on position(x: " +
          position.x + "; y: " + position.y + ")");
        console.log('Event: ', gameEvents.client_newFruit);
        player.socket.emit(gameEvents.client_newFruit, position);
      });
    }
  }

  this.lastFruit = now;
};

Room.prototype.checkFruitCollision = function(snake) {
  if (this.fruits.length > 0) {
    var x = parseInt(snake.head.x / BLOCK_WIDTH, 10);
    var y = parseInt(snake.head.y / BLOCK_HEIGHT, 10);

    //console.log("snake[x: " + x + "; y: " + y + "] fruit[x: " + self.fruits[0].x + "; y: " + self.fruits[0].y + "]");

    if (x === this.fruits[0].x &&
      y === this.fruits[0].y) {
      console.log("Snake ate the fruit.");
      this.fruits = [];
      snake.grow();
    }
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

Room.prototype.getPlayers = function() {
  return this.players;
};

Room.prototype.debugInfo = function () {
  var self = this;
  var fruitsInfo = "";
  this.fruits.forEach(function (fruit, index) {
    fruitsInfo += fruit.debugInfo();
    if (index < self.fruits.length - 1) {
      fruitsInfo += ",";
    }
  });

  var playersInfo = "";
  this.players.forEach(function (player, index) {
    playersInfo += player.snake.debugInfo();
    if (index < self.players.length - 1) {
      playersInfo += ",";
    }
  });

  return '{"id":' + this.id + ',"worldWidth":' + this.worldWidth + ',"worldHeight":' + this.worldHeight + 
    ',"fruits":[' + fruitsInfo + '],"players":[' + playersInfo + ']}';
};

Room.prototype.printDebugInfo = function () {
  console.log(this.debugInfo());
};

module.exports = Room;
