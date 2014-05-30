define(function() {
  'use strict';

  var Storage = window.localStorage;
  return {
    set: function(key, val) {
      return Storage && (Storage[key] = val);
    },
    get: function(key) {
      return Storage && Storage[key];
    },
    del: function(key) {
      return Storage && Storage.removeItem(key);
    }
  };

});
