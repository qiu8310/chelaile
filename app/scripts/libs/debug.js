var utils = require('./utils');


var QUERY = utils.objectifyQuery(window.location.search.substr(1)),
    Debug = {},
    debugKey = (QUERY.__DEBUG || '0').toString().toLowerCase(),
    debugMap = {
      'true' : 1,
      'yes'  : 1,
      all    : 1,
      success: 2,
      info   : 3,
      log    : 4,
      warn   : 5,
      error  : 6
    };

// 计算出整数级别
debugKey = (debugKey in debugMap) ? debugMap[debugKey] : (parseInt(debugKey) || 0);


function _log(elem, msg, append) {
  if (append || append === undefined) {
    msg = utils.elemText(elem) + '\r\n' + msg;
  }
  utils.elemText(elem, msg);
}

var wrap = function(key) {
  return function() {
    if (debugKey < 1 || debugKey > debugMap[key]) {
      return false;
    }

    var container = utils._('.__debug');
    if (!container) {
      container = document.createElement('div');
      container.className = '__debug';
      (document.getElementById('root') || document.body).appendChild(container);
    }
    var elem = document.createElement('div');
    elem.className = key;
    container.appendChild(elem);

    var args = [].slice.call(arguments, 0);
    var msg = [], append = true;

    if (typeof args[args.length - 1] === 'boolean') {
      append = args.pop();
    }

    args.forEach(function(arg) {
      if (typeof arg === 'object') {
        try {
          arg = JSON.stringify(arg);
        } catch (e) { arg = arg.toString(); }
      }
      msg.push(arg);
    });

    _log(elem, msg.join(', '), append);
  };
};

for (var key in debugMap) {
  if (debugMap[key] < 2) {
    continue;
  }
  Debug[key] = wrap(key);
}

module.exports = Debug;