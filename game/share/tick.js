var tick = function() {
  var ticks = 0;
  var timer;

  if (typeof requestAnimationFrame === 'undefined') {
    console.log("Request Animation Frame is undefined");
    timer = function (callback) {
      setImmediate(function() {
        callback(++ticks);
      }, 0);
    }
  } else {
    console.log("Using Request Animation Frame");
    timer = window.requestAnimationFrame;
  }

  return function (callback) {
    return timer(callback);
  }
};

module.exports = tick();
