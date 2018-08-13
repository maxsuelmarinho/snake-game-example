var Renderer = require('./renderer.js');
var Game = require('./game.js');
var Snake = require('./snake.js');
var Fruit = require('./fruit.js');
var keys = require('./keyboard.js');

var BLOCK_WIDTH = 16;
var BLOCK_HEIGHT = 16;
var FPS = 20;
var renderer =
  new Renderer(0, 0, document.getElementById('gameCanvas'));
var game = new Game(FPS);

var playerAColor = '#0c0';
var player = new Snake(
  parseInt(Math.random() * 999999, 10),
  playerAColor,
  parseInt(Math.random() * window.innerWidth / 1.5, 10),
  parseInt(Math.random() * window.innerHeight / 1.5, 10),
  BLOCK_WIDTH,
  BLOCK_HEIGHT
);
var fruits = [];
var fruitColor = '#c00';
var fruitDelta = 0;
var fruitDelay = 1500;
var lastFruit = 0;

var ctx = renderer.ctx;
var scoreWidget = document.querySelector('#scoreA span');

console.log(player);

game.onUpdate = function(delta) {
  var now = performance.now();

  if (fruits.length < 1) {
    fruitDelta = now - lastFruit;

    if (fruitDelta >= fruitDelay) {
      console.log("width: ", renderer.canvas.width, "; height: ", renderer.canvas.height);
      fruits[0] = new Fruit(
        fruitColor,
        parseInt(Math.random() * renderer.canvas.width / BLOCK_WIDTH / 2, 10),
        parseInt(Math.random() * renderer.canvas.height / BLOCK_HEIGHT / 2, 10),
        BLOCK_WIDTH,
        BLOCK_HEIGHT
      );
      console.log(fruits[0]);
    }
  }

  player.update(delta);
  player.checkCollision();

  if (player.head.x < 0) {
    player.head.x =
      parseInt(renderer.canvas.width / player.width, 10);
  }

  if (player.head.x > parseInt(renderer.canvas.width / player.width, 10)) {
    player.head.x = 0;
  }

  if (player.head.y < 0) {
    player.head.y =
      parseInt(renderer.canvas.height / player.height, 10);
  }

  if (player.head.y > parseInt(renderer.canvas.height / player.height, 10)) {
    player.head.y = 0;
  }

  if (fruits.length > 0) {
    if (player.head.x === fruits[0].x &&
      player.head.y === fruits[0].y) {

      player.grow();
      fruits = [];
      lastFruit = now;
    }
  }
};

game.onRender = function() {
  ctx.clearRect(0, 0, renderer.canvas.width, renderer.canvas.height);

  player.pieces.forEach(function(piece) {
    ctx.fillStyle = player.color;
    ctx.fillRect(
      piece.x * player.width,
      piece.y * player.height,
      player.width,
      player.height
    );

    fruits.forEach(function(fruit) {
      ctx.fillStyle = fruit.color;
      ctx.fillRect(
        fruit.x * fruit.width,
        fruit.y * fruit.height,
        fruit.width,
        fruit.height
      );
    });
  });
};

player.on(Snake.events.POWER_UP, function(event) {
  var score = event.size * 10;
  scoreWidget.textContent = '000000'.slice(0, -(score + '').length) + score + '';
})

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
