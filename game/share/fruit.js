var Fruit = function(colorHex, x, y, width, height) {
  this.color = colorHex;
  this.x = x;
  this.y = y;
  this.width = width || 16;
  this.height = height || 16;
};

module.exports = Fruit;
