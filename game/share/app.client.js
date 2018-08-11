var Renderer = require('./renderer.js');
var Game = require('./game.js');

var BLOCK_WIDTH = 16;
var BLOCK_HEIGHT = 16;
var FPS = 20;
var renderer =
  new Renderer(0, 0, document.getElementById('gameCanvas'));
var game = new Game(FPS);
var ctx = renderer.ctx;

game.onUpdate = function() {

};

game.onRender = function() {
  ctx.clearRect(0, 0, renderer.canvas.width, renderer.canvas.height);
  ctx.fillStyle = '#0000FF';
  ctx.fillRect(0, 0, renderer.canvas.width, renderer.canvas.height);
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
