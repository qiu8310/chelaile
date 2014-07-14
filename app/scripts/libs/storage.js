'use strict';

var Storage = window.localStorage;
module.exports = {
  set: function(key, val) {
    if (Storage) {
      Storage[key] = val;
    }
  },
  get: function(key) {
    return Storage && Storage[key];
  },
  del: function(key) {
    if (Storage) {
      Storage.removeItem(key);
    }
  }
};

