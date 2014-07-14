var utils = require('./utils');

var last;

function positionIn(last) {
  var offset, w, h, tw, th;
  var gap = 5; // 允许的误差
  var dropzone = last.dropzone;

  offset = utils.offset(dropzone);
  w = parseInt(utils.css(dropzone, 'width'), 10);
  h = parseInt(utils.css(dropzone, 'height'), 10);

  if (last.top >= offset.top - gap && last.left >= offset.left - gap && last.top + last.h <= offset.top + h + gap && last.left + last.w <= offset.left + w + gap) {
    return true;
  } else {
    return false;
  }
}

function touchstart(e) {
  var touch = e.touches ? e.touches[0] : e, target = touch.target;
  if (!target || !target.getAttribute('draggable') || last) { return true; }

  var offset = utils.offset(target);
  target.style.position = 'absolute';
  target.style.zIndex = 100;
  target.style.top = offset.top + 'px';
  target.style.left = offset.left + 'px';

  last = {
    target  : target,
    dropzone: utils._(target.dataset.dropSelector || '.dropzone'),
    w       : parseInt(utils.css(target, 'width'), 10),
    h       : parseInt(utils.css(target, 'height'), 10),
    x       : touch.clientX,
    y       : touch.clientY,
    top     : offset.top,
    left    : offset.left
  };
  e.preventDefault();
}

function touchmove(e) {
  var touch = e.touches ? e.touches[0] : e;
  if (!last) { return true; }
  if (!touch) {
    last = false;
    return true;
  }

  var style = last.target.style;
  var left = last.left + touch.clientX - last.x, top = last.top + touch.clientY - last.y;

  style.left = left + 'px';
  style.top = top + 'px';

  last.top = top;
  last.left = left;
  last.x = touch.clientX;
  last.y = touch.clientY;

  if (positionIn(last)) {
    last.dropzone.classList.add('dropover');
  } else {
    last.dropzone.classList.remove('dropover');
  }

  e.preventDefault();
}

function touchend(e) {
  if (!last) {
    return true;
  }

  if (positionIn(last)) {

    var event = document.createEvent('Event');
    event.initEvent('drop', false, false);
    event.detail = last;

    // 一些安卓还不支持此方法
    // var event = new CustomEvent('drop', {detail: last});

    last.dropzone.dispatchEvent(event);

  } else {
    last.target.setAttribute('style', '');
    last.dropzone.classList.remove('dropover');
  }

  last = null;
}

module.exports = function() {
  utils.on(document, 'touchstart mousedown', touchstart);
  utils.on(document, 'touchmove mousemove', touchmove);
  utils.on(document, 'touchend touchcancel mouseup', touchend);
};

