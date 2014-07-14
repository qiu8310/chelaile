'use strict';
var parse = require('./url-parser');

var urlObj = parse(location.href);

var _path = urlObj.path;
//  去掉最前的 /
if (_path.charAt(0) === '/') {
  _path = _path.substr(1);
}

// 去掉后缀名
if (_path.lastIndexOf('.') >= 0) {
  _path = _path.substring(0, _path.lastIndexOf('.'));
}

// 首页
if (_path === '') {
  _path = 'index';
}


var _pathMap = {};
module.exports = {
  all  : function(callback) {
    return this.on('_all_', callback);
  },
  on   : function(path, callback) {
    _pathMap[path] = true;

    if (_path === path || path === '_all_') {
      if (typeof callback === 'function') {
        callback.call(this, _path, urlObj);
      }
    }

    return this;
  },
  other: function(callback) {
    if (!(_path in _pathMap)) {
      if (typeof callback === 'function') {
        callback.call(this, _path, urlObj);
      }
    }
    return this;
  }
};