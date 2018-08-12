var keys = require('./keyboard.js');

var Snake = function(id, colorHex, x, y, width, height) {
  this.id = id;
  this.color = colorHex;
  this.head = {
    x: x,
    y: y
  };
  this.width = width || 16;
  this.height = height || 16;
  this.pieces = [this.head];
  this.input = {};
};

Snake.prototype.setKey = function(key) {
  this.input[keys.UP] = false;
  this.input[keys.DOWN] = false;
  this.input[keys.LEFT] = false;
  this.input[keys.RIGHT] = false;
  this.input[key] = true;
};

Snake.prototype.update = function(delta) {
  if (this.input[keys.LEFT]) {
      this.head.x += -1;
  } else if (this.input[keys.RIGHT]) {
    this.head.x += 1;
  } else if (this.input[keys.UP]) {
    this.head.y += -1;
  } else if (this.input[keys.DOWN]) {
    this.head.y += 1;
  }
};
module.exports = Snake;
