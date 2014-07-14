'use strict';

var utils = require('./utils');

function touchstart(e) {
  touchend();
  var target = e.target, i = 0, up = 3;
  while (target && target.nodeName.toUpperCase() !== 'HTML' && !target.classList.contains('touchable') && i < up) {
    target = target.parentNode;
    i++;
  }

  if (target && target.classList.contains('touchable')) {
    target.classList.add('touched');
  }
}


function touchend() {
  utils.__('.touched').forEach(function(ele) {
    ele.classList.remove('touched');
  });
}

function touchable() {
  document.addEventListener('touchstart', touchstart, false);
  document.addEventListener('touchend', touchend, false);
  document.addEventListener('touchcancel', touchend, false);
}


/*
 opts:
 text: 禁用按钮时的文本
 class: 禁用按钮时需要添加的自定义的类

 */
function asyncClick(ele, opts, func) {
  if (typeof opts === 'function') {
    func = opts;
    opts = null;
  }
  opts = opts || {};

  ele.addEventListener('click', function(e) {
    var ele = e.target, classList = ele.classList, data = ele.dataset;
    e.preventDefault();

    if (classList.contains('disabled')) {
      return false;
    }

    classList.add('disabled');
    ele.dataset.defaultText = utils.elemText(ele);

    var text = opts.text || data.text, className = opts.class || data.class;
    if (text) {
      utils.elemText(ele, text);
    }
    if (className) {
      classList.add(className);
    }


    var done = function(interrupt) {
      classList.remove('disabled');
      if (text) {
        utils.elemText(ele, ele.dataset.defaultText);
      }
      if (className) {
        classList.remove(className);
      }

      if (interrupt) {
        throw new Error('btn_async_done');
      }
    };
    try {
      func.call(ele, e, done);
    } catch (e) {
      if (e.message !== 'btn_async_done') {
        throw e;
      }
    }


  }, false);
}


module.exports = {
  touchable : touchable,
  asyncClick: asyncClick
};

