var Fruit = function(colorHex, x, y, width, height) {
  this.color = colorHex;
  this.x = x;
  this.y = y;
  this.width = width || 16;
  this.height = height || 16;
};

Fruit.prototype.debugInfo = function () {
  return '{"x":' + this.x + ',"y":' + this.y + 
  ',"width":' + this.width + ',"height":' + this.height + '}';
};

Fruit.prototype.printDebugInfo = function () {
  console.log(this.debugInfo());
};

module.exports = Fruit;
