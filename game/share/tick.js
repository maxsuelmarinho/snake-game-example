var tick = function() {
  var ticks = 0;
  var timer;

  if (typeof requestAnimationFrame === 'undefined') {
    console.log("Request Animation Frame is undefined");
    timer = function (callback) {
      setImmediate(function() {
        var now = milliseconds();
        //console.log(now);
        callback(now);
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

function nanotime() {
  var hrtime = process.hrtime();
  // 0 - seconds
  // 1 - nanoseconds
  return hrtime[0] * 1000000000 + hrtime[1];
}

function seconds() {
  var hrtime = process.hrtime();
  return hrtime[0] + hrtime[1] * 0.000000001;
}

function milliseconds() {
  var hrtime = process.hrtime();
  return hrtime[0] * 1000 + hrtime[1] * 0.000001;
}

module.exports = tick();
