var tick = function() {
  var ticks = 0;
  var timer;

  if (typeof requestAnimationFrame === 'undefined') {
    timer = function(callback) {
      setImmediate(function() {
        callback(++ticks);
      }, 0);
    }
  } else {
    timer = window.requestAnimationFrame;
  }

  return function (callback) {
    return timer(callback);
  }
};

module.exports = tick();
