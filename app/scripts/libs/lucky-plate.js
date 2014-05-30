define(['libs/utils'], function(utils) {

  'use strict';

  var indexes = 12; // 共12个方格
  var deg     = 360 / indexes; // 每个方格所占的角度
  var lastDegree = 0;
  var lastIndex = 0;

  var inited = false;
  var cb;

  function animate(cards, degree, msecond) {
    utils.css(cards, 'transitionDuration', msecond + 'ms');
    utils.css(cards, 'transform', 'rotate(' + degree + 'deg) translateZ(0px)');
  }


  function indexToDegree(index) {
    return deg * utils.circle(indexes - index, indexes);
  }

  function transitionend() {
    if (typeof cb === 'function') {
      cb(lastIndex);
    }
  }

  function init(elem) {
    if (inited) return ;
    elem.addEventListener('webkitTransitionEnd', transitionend, false);
    elem.addEventListener('msTransitionEnd', transitionend, false);
    elem.addEventListener('oTransitionEnd', transitionend, false);
    elem.addEventListener('otransitionend', transitionend, false);
    elem.addEventListener('transitionend', transitionend, false);
    inited = true;
  }

  return {

    /**
     *  stopIndex:  停下来的那个方格的索引
     *  callback:   转盘结束的回调函数
     *  speed:      转速度 [转/秒]
     *  msecond:    停下来时运行的毫秒数，默认3000
     */
    run: function(elem, stopIndex, callbacks, speed, msecond) {
      var cards = utils._('.cards', elem),
        degree, count; // 要转到的角度， 要转的圈数

      // 初始化动画结束监听函数
      init(cards);
      cb = callbacks.runEnd;

      // 设置默认参数
      stopIndex = typeof stopIndex === 'number' ? stopIndex : Math.round(Math.random() * (indexes * 2));
      stopIndex = utils.circle(stopIndex, indexes);
      speed = speed || 2;
      msecond = msecond || 3000;

      // 计算角度和应该旋转的次数
      degree = indexToDegree(stopIndex);
      count = speed * msecond / 1000 + 2;

      // 与上一次旋转的角度来个中和，避免一直往一个方向转
      var lastCount;
      if (lastDegree > 0) {
        lastCount = Math.ceil(lastDegree / 360);
        degree = (lastCount - count) * 360 + degree;
      } else {
        lastCount = Math.floor(lastDegree / 360);
        degree = (lastCount + count) * 360 + degree;
      }

      lastDegree = degree;
      lastIndex = stopIndex;

      // 旋转
      callbacks.runStart && callbacks.runStart();
      animate(cards, degree, msecond);

    }
  };
});
