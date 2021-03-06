var tick = require('./tick.js');

var Game = function(fps, worldWidth, worldHeight) {
  this.fps = fps;
  this.worldWidth = worldWidth;
  this.worldHeight = worldHeight
  this.delay = 1000 / this.fps;
  this.lastTime = 0;
  this.raf = 0;

  this.onStart = function() {};

  this.onUpdate = function(delta) {};

  this.onRender = function() {};
  
};

Game.prototype.update = function(delta) {
  this.onUpdate(delta);
};

Game.prototype.render = function() {
  this.onRender();
};

Game.prototype.loop = function(now) {
  this.raf = tick(this.loop.bind(this));
  
  var delta = now - this.lastTime;
  if (delta >= this.delay) {
    this.update(delta * 0.001);
    this.render();
    this.lastTime = now;
  }
};

Game.prototype.start = function() {
  this.onStart();
  
  if(this.raf < 1) {
    this.loop(0);
  }
};

Game.prototype.stop = function() {
  if(this.raf > 0) {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
};

module.exports = Game;
