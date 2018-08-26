var Renderer = require('./renderer.js');
var Game = require('./game.js');
var Snake = require('./snake.js');
var Fruit = require('./fruit.js');
var keys = require('./keyboard.js');
var gameEvents = require('./events.js');
var socket = require('socket.io-client')(window.location.origin);

var BLOCK_WIDTH = 16;
var BLOCK_HEIGHT = 16;
var FPS = 20;
var renderer =
  new Renderer(0, 0, document.getElementById('gameCanvas'));
var game = new Game(FPS);

var playerAColor = '#0c0';
var player;

var fruits;
var fruitColor = '#c00';
var fruitDelta;
var fruitDelay = 1500;
var lastFruit;

var ctx = renderer.ctx;
var scoreWidget = document.querySelector('#scoreA span');
var gameOver = document.getElementById('gameOver');

var roomId = 0;
var roomList = document.getElementById('roomList');
var screens = {
  main: document.getElementById('main'),
  lobby: document.getElementById('lobby')
};

function initGame() {
  gameOver.classList.add('hidden');
  scoreWidget.textContent = '000000';

  player = new Snake(
    parseInt(Math.random() * 999999, 10),
    playerAColor,
    parseInt(Math.random() * window.innerWidth / 1.5, 10),
    parseInt(Math.random() * window.innerHeight / 1.5, 10),
    BLOCK_WIDTH,
    BLOCK_HEIGHT
  );

  player.on(Snake.events.POWER_UP, function(event) {
    var score = event.size * 10;
    scoreWidget.textContent = '000000'.slice(0, -(score + '').length) + score + '';
  });

  player.on(Snake.events.COLLISION, function(event) {
    scoreWidget.parentElement.classList.add('gameOver');

    game.stop();
    setTimeout(function() {
      ctx.fillStyle = '#f00';
      ctx.fillRect(
        event.point.x * player.width,
        event.point.y * player.height,
        player.width,
        player.height
      );
    }, 0);

    setTimeout(function() {
      gameOver.classList.remove('hidden');
    }, 100);
  });

  console.log(player);

  fruits = [];
  lastFruit = 0;
  fruitDelta = 0;
}

initGame();

game.onUpdate = function(delta) {
  var now = performance.now();

  /*
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
  */

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
      initGame();
      game.start();
      break;
    case keys.LEFT:
    case keys.RIGHT:
    case keys.UP:
    case keys.DOWN:
      player.setKey(key);
      socket.emit(gameEvents.server_setPlayerKey, {
        roomId: roomId,
        playerId: player.id,
        keyCode: key
      });
      break;
  }
});

socket.on('connect', function() {
  console.log("client connected");

  console.log('Sending event:', gameEvents.server_listRooms);
  socket.emit(gameEvents.server_listRooms);
});

socket.on(gameEvents.client_roomJoined, function(data) {
  console.log("Event:", gameEvents.client_roomJoined, "Room id:", data.roomId);
  roomId = data.roomId

  screens.lobby.classList.add('hidden');
  screens.main.classList.remove('hidden');

  console.log("Player " + player.id + " joined room " + roomId);

  console.log('Sending event:', gameEvents.server_startRoom);
  socket.emit(gameEvents.server_startRoom, {
    roomId: roomId
  });

  game.start();
});

socket.on(gameEvents.client_roomsList, function(rooms) {
  console.log("Event:", gameEvents.client_roomsList, "Rooms:", rooms);

  rooms.map(function(room, index) {
    console.log("Room " + index + ": " + room.players.length + " player(s)");

    var textContent = room.players.length +
      ' player' + (room.players.length > 1 ? 's' : '');
    var roomWidget = createRoomWidget(textContent, function() {
      console.log('Sending event:', gameEvents.server_joinRoom);
      socket.emit(gameEvents.server_joinRoom, {
        roomId: room.roomId,
        player: {
          id: player.id,
          x: player.head.x,
          y: player.head.y,
          color: player.color,
        }
      })
    });
    roomList.appendChild(roomWidget);
  });

  var roomWidget = createRoomWidget('New Game', function() {
    console.log('Sending event:', gameEvents.server_newRoom);
    socket.emit(gameEvents.server_newRoom, {
      player: {
        id: player.id,
        x: player.head.x,
        y: player.head.y,
        color: player.color
      },
      maxWidth: window.innerWidth,
      maxHeight: window.innerHeight
    });
  });
  roomWidget.classList.add('newRoomWidget');
  roomList.appendChild(roomWidget);
});

socket.on(gameEvents.client_newFruit, function(fruit) {
  console.log('Event:', gameEvents.client_newFruit);

  fruits[0] = new Fruit(
    fruitColor,
    parseInt(fruit.x / BLOCK_WIDTH, 10),
    parseInt(fruit.y / BLOCK_HEIGHT, 10),
    BLOCK_WIDTH,
    BLOCK_HEIGHT
  );

  console.log("snake", player, "Fruit client", fruits[0], "fruit server", fruit);
});

function createRoomWidget(text, clickCallback) {
  var roomWidget = document.createElement('div');
  roomWidget.textContent = text;
  roomWidget.addEventListener('click', clickCallback);

  return roomWidget;
}
