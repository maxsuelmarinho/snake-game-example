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
}

module.exports = Snake;
