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
var game;

var player;
var otherPlayers = [];

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

var updateCount = 0;

function initGame() {
  console.log("Client:initGame")

  game = new Game(FPS, renderer.canvas.width, renderer.canvas.height);

  gameOver.classList.add('hidden');
  scoreWidget.textContent = '000000';

  player = new Snake(
    parseInt(Math.random() * 999999, 10),
    randomColor(),
    Math.random() * renderer.canvas.width / 1.5,
    Math.random() * renderer.canvas.height / 1.5,
    BLOCK_WIDTH,
    BLOCK_HEIGHT
  );

  player.on(Snake.events.POWER_UP, function(event) {
    console.log("Event:", Snake.events.POWER_UP);
    var score = event.size * 10;
    scoreWidget.textContent = '000000'.slice(0, -(score + '').length) + score + '';
  });

  player.on(Snake.events.COLLISION, function(event) {
    console.log("Event:", Snake.events.COLLISION);
    scoreWidget.parentElement.classList.add('gameOver');

    game.stop();
    setTimeout(function() {
      ctx.fillStyle = '#f00';
      ctx.fillRect(
        event.point.x * BLOCK_WIDTH,
        event.point.y * BLOCK_HEIGHT,
        BLOCK_WIDTH,
        BLOCK_HEIGHT
      );
    }, 0);

    setTimeout(function() {
      gameOver.classList.remove('hidden');
    }, 100);
  });

  fruits = [];
  lastFruit = 0;
  fruitDelta = 0;

  otherPlayers = [];

  player.printDebugInfo();
}

function snakeRender(snake) {
  snake.pieces.forEach(function (piece) {
    ctx.fillStyle = snake.color;
    ctx.fillRect(
      piece.x,
      piece.y,
      snake.width,
      snake.height
    );
  });
}

function fruitRender(fruit) {
  ctx.fillStyle = fruit.color;
  ctx.fillRect(
    fruit.x,
    fruit.y,
    fruit.width,
    fruit.height
  );
}

function randomColor() {
  return "#" + ((1 << 24) * Math.random() | 0).toString(16);
}

function createRoomWidget(text, clickCallback) {
  var roomWidget = document.createElement('div');
  roomWidget.textContent = text;
  roomWidget.addEventListener('click', clickCallback);

  return roomWidget;
}

function resizeGame() {
  var gameArea = document.getElementById('gameArea');
  var widthToHeight = 4 / 3;
  var newWidth = window.innerWidth;
  var newHeight = window.innerHeight;
  var newWidthToHeight = newWidth / newHeight;

  if (newWidthToHeight > widthToHeight) {
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
initGame();

game.onStart = function () {
  console.log("Client:game:onStart");
  player.printDebugInfo();
};

game.onUpdate = function (delta) {
  //console.log("Client:game:onUpdate");
  //player.printDebugInfo();
  updateCount++;
  //console.log("updateCount", updateCount);
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
    player.head.x = renderer.canvas.width;
  }

  if (player.head.x > renderer.canvas.width) {
    player.head.x = 0;
  }

  if (player.head.y < 0) {
    player.head.y = renderer.canvas.height;
  }

  if (player.head.y > renderer.canvas.height) {
    player.head.y = 0;
  }

  if (fruits.length > 0) {

    if (player.head.x < fruits[0].x + BLOCK_WIDTH &&
      player.head.x + BLOCK_WIDTH >= fruits[0].x &&
      player.head.y < fruits[0].y + BLOCK_HEIGHT &&
      player.head.y + BLOCK_HEIGHT > fruits[0].y) {

      player.printDebugInfo();
      fruits[0].printDebugInfo();

      player.grow();
      fruits = [];
      lastFruit = now;
    }
  }
};

game.onRender = function() {
  //console.log("Client:game:onRender");
  //player.printDebugInfo();
  ctx.clearRect(0, 0, renderer.canvas.width, renderer.canvas.height);

  snakeRender(player);

  fruits.forEach(function (fruit) {
    fruitRender(fruit);
  });

  otherPlayers.map(function(snake) {
    snakeRender(snake);
  });
};

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
    case keys.D:
      console.log("player", player);
      console.log("otherPlayers", otherPlayers);
      console.log("fruits", fruits);
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
      player.color = randomColor();
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
      maxWidth: renderer.canvas.width,
      maxHeight: renderer.canvas.height
    });
  });
  roomWidget.classList.add('newRoomWidget');
  roomList.appendChild(roomWidget);
});

socket.on(gameEvents.client_newFruit, function(fruit) {
  console.log('Event:', gameEvents.client_newFruit);

  fruits[0] = new Fruit(
    fruitColor,
    fruit.x,
    fruit.y,
    BLOCK_WIDTH,
    BLOCK_HEIGHT
  );

  fruits[0].printDebugInfo();
});

socket.on(gameEvents.client_playerState, function(data) {
  //console.log('Event:', gameEvents.client_playerState);

  otherPlayers = data.filter(function(_player) {
    _player.width = BLOCK_WIDTH;
    _player.height = BLOCK_HEIGHT;

    return _player.id != player.id;
  });

  //console.log("otherPlayers", otherPlayers);
});
