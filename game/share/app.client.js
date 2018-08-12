var Renderer = require('./renderer.js');
var Game = require('./game.js');
var Snake = require('./snake.js');
var keys = require('./keyboard.js');

var BLOCK_WIDTH = 16;
var BLOCK_HEIGHT = 16;
var FPS = 20;
var renderer =
  new Renderer(0, 0, document.getElementById('gameCanvas'));
var game = new Game(FPS);
var ctx = renderer.ctx;

var playerAColor = '#0c0';
var player = new Snake(
  parseInt(Math.random() * 999999, 10),
  playerAColor,
  parseInt(Math.random() * window.innerWidth / 1.5, 10),
  parseInt(Math.random() * window.innerHeight / 1.5, 10),
  BLOCK_WIDTH,
  BLOCK_HEIGHT
);

console.log(player);

game.onUpdate = function(delta) {
  player.update(delta);
};

game.onRender = function() {
  ctx.clearRect(0, 0, renderer.canvas.width, renderer.canvas.height);

  ctx.fillStyle = player.color;
  player.pieces.forEach(function(piece) {
    ctx.fillRect(
      piece.x + player.width,
      piece.y + player.height,
      player.width,
      player.height
    );
  });
};

function resizeGame() {
  var gameArea = document.getElementById('gameArea');
  var widthToHeight = 4 / 3;
  var newWidth = window.innerWidth;
  var newHeight = window.innerHeight;
  var newWidthToHeight = newWidth / newHeight;

  if(newWidthToHeight > widthToHeight) {
    newWidth = newHeight * widthToHeight;
  } else {
    newHeight = newWidth / widthToHeight;
  }

  gameArea.style.width = newWidth + 'px';
  gameArea.style.height = newHeight + 'px';

  gameArea.style.marginTop = (-newHeight / 2) + 'px';
  gameArea.style.marginLeft = (-newWidth / 2) + 'px';

  renderer.canvas.width = newWidth;
  renderer.canvas.height = newHeight;
}

window.addEventListener('resize', resizeGame, false);
window.addEventListener('orientationchange', resizeGame, false);
resizeGame();

document.body.addEventListener('keydown', function(e) {
  var key = e.keyCode;

  switch(key) {
    case keys.ESC:
      game.stop();
      break;
    case keys.SPACEBAR:
      game.start();
      break;
    case keys.LEFT:
    case keys.RIGHT:
    case keys.UP:
    case keys.DOWN:
      player.setKey(key);
      break;
  }
});
