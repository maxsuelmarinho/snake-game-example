var tick = function(delay) {
  var _delay = delay;
  var timer;

  if (typeof requestAnimationFrame === 'undefined') {
    timer = function(callback) {
      setImmediate(function() {
        callback(_delay);
      }, _delay);
    }
  } else {
    timer = window.requestAnimationFrame;
  }

  return function (callback) {
    return timer(callback);
  }
};

module.exports = tick;
