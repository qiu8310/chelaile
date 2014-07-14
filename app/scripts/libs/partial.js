'use strict';


function partials_each(key, callback) {

  // 不做缓存，防止页面动态更新
  var all = document.querySelectorAll('.' + key);
  if (all && (typeof callback === 'function')) {
    for (var i = 0; i < all.length; ++i) {
      callback.call(all, all[i], i);
    }
  }
  return all;
}

module.exports = function(key, val) {
  if (arguments.length === 1) {
    val = key;
    key = 'partial';
  }

  partials_each(key, function(elem) {
    var partial_val = elem.getAttribute('data-' + key);

    if (!partial_val) {
      elem.classList.add('hidden');
    } else {
      partial_val = ',' + partial_val.split(/\s*,\s*/).join(',') + ',';

      if (partial_val.indexOf(val) >= 0) {
        elem.classList.remove('hidden');
      } else {
        elem.classList.add('hidden');
      }
    }
  });

};

