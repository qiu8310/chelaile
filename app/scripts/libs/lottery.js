'use strict';
var utils = require('./utils');

var defaultOpts = {
  maskImg    : '../images/archive/lottery/mask.png',
  prizeImg   : '../images/archive/lottery/prize.png',
  rate       : 0.5,    // 刮完了多少的面积就算刮完
  width      : 260,   // 刮奖区域的宽度  保证图片的宽度是它的两倍
  height     : 150,  // 刮奖区域的高度  保证图片的高度是它的两倍
  strokeWidth: 40,  // 刮奖的手指的大小
  success    : null,  // 成功的回调函数
  error      : null     // 出错时的回调函数
};

function loadImg(imgsrc, callback) {
  var img = new Image();
  if (typeof callback === 'function') {
    img.onload = function() {
      callback.call(img);
      img.onload = null;
    };
  }
  img.src = imgsrc;
}

// 画线
function scratch(ctx, x, y, fresh) {
  if (fresh) {
    ctx.beginPath();
    ctx.moveTo(x + 0.01, y);
  }
  ctx.lineTo(x, y);
  ctx.stroke();
}

// 获取在 elem 上的坐标
function getLocalCoords(elem, ev) {
  var ox = 0, oy = 0;
  var first;
  var pageX, pageY;
  while (elem !== null) {
    ox += elem.offsetLeft;
    oy += elem.offsetTop;
    elem = elem.offsetParent;
  }
  if (ev.hasOwnProperty('changedTouches')) {
    first = ev.changedTouches[0];
    pageX = first.pageX;
    pageY = first.pageY;
  } else {
    pageX = ev.pageX;
    pageY = ev.pageY;
  }

  var offset = 0.5; // width / canvasWidth;

  // 用了 fixed 定位，所以加上下面这行！
  pageY = pageY - (document.body.scrollTop || 0);
  return { 'x': (pageX - ox) / offset, 'y': (pageY - oy) / offset };
}

function Lottery(container, opts) {
  this.opts = utils.extend({}, defaultOpts, opts);
  var self = this;

  opts = this.opts;

  if (!container || !container.nodeName) {
    throw new Error('Lottery container not exist');
  }

  this.container = container;
  this.canvas = document.createElement('canvas');
  this.canvas.style.width = '100%';
  this.ctx = this.canvas.getContext('2d');
  container.appendChild(this.canvas);

  this.reset();

  // 用来计算是否刮完了
  // 将 canvas 化成 canvasWidth/strokeWidth  *  canvasHeight/strokeWidth 的一个矩形
  var canvas = this.canvas, ctx = this.ctx, canvasWidth = opts.width * 2, canvasHeight = opts.height * 2;
  var ROWS = {};
  var MARK_COUNT = 0;
  var MARK_TOTAL = Math.round((canvasWidth / opts.strokeWidth) * (canvasHeight / opts.strokeWidth));

  function mark(local) {
    var row, col;
    row = Math.round(local.y / opts.strokeWidth);
    col = Math.round(local.x / opts.strokeWidth);
    if (!ROWS[row]) {
      ROWS[row] = [];
    }

    if (ROWS[row].indexOf(col) < 0) {
      ROWS[row].push(col);
      MARK_COUNT++;
    }
  }

  function isFinish() {
    return MARK_COUNT / MARK_TOTAL >= opts.rate;
  }

  function mousedownHandler(e) {
    var local = getLocalCoords(canvas, e);
    if (!self.isStarted) {
      if (opts.error) {
        opts.error.call(self, 101, '资源尚未加载完成');
      }
      return;
    }
    if (local.x < 0 || local.y < 0 || local.x > canvasWidth || local.y > canvasHeight) {
      return false;
    }
    scratch(ctx, local.x, local.y, true);
    mark(local);
    self.isMouseDown = true;
    e.preventDefault();
    return false;
  }

  function mousemoveHandler(e) {
    if (!self.isMouseDown) { return true; }
    var local = getLocalCoords(canvas, e);
    scratch(ctx, local.x, local.y);
    mark(local);
    e.preventDefault();
    return false;
  }

  function mouseupHandler(e) {
    if (self.isMouseDown) {
      if (isFinish()) {
        self.isStarted = false;
        if (typeof opts.success === 'function') {
          opts.success.call(self);
        }
      }
      self.isMouseDown = false;
      e.preventDefault();
      return false;
    }
    return true;
  }

  this._funcs = [mousedownHandler, mousemoveHandler, mouseupHandler]; // 记录函数，方便销毁
  this.canvas.addEventListener('mousedown', mousedownHandler, false);
  this.canvas.addEventListener('touchstart', mousedownHandler, false);
  window.addEventListener('mousemove', mousemoveHandler, false);
  window.addEventListener('touchmove', mousemoveHandler, false);
  window.addEventListener('mouseup', mouseupHandler, false);
  window.addEventListener('touchend', mouseupHandler, false);
  window.addEventListener('touchcancel', mouseupHandler, false);
}

Lottery.prototype.destroy = function() {
  this.canvas.removeEventListener('mousedown', this._funcs[0], false);
  this.canvas.removeEventListener('touchstart', this._funcs[0], false);
  window.removeEventListener('mousemove', this._funcs[1], false);
  window.removeEventListener('touchmove', this._funcs[1], false);
  window.removeEventListener('mouseup', this._funcs[2], false);
  window.removeEventListener('touchend', this._funcs[2], false);
  window.removeEventListener('touchcancel', this._funcs[2], false);
  this.ctx = this.opts = this.canvas = this.container = this._funcs = null;
};

Lottery.prototype.reset = function(opts) {
  this.opts = utils.extend(this.opts, opts);

  this.isMouseDown = false;
  this.isStarted = false;


  opts = this.opts;

  // 初始化
  var canvasWidth = opts.width * 2, canvasHeight = opts.height * 2;
  this.container.style.width = opts.width + 'px'; // 为了支持 retina 屏
  this.container.style.height = opts.height + 'px';
  this.canvas.width = canvasWidth;
  this.canvas.height = canvasHeight;

  var self = this, ctx = this.ctx;

  ctx.width = ctx.width; // clear canvas


  // 设置 cover
  loadImg(opts.maskImg, function() {
    ctx.drawImage(this, 0, 0, canvasWidth, canvasHeight);

    // 加载奖品图片
    loadImg(opts.prizeImg, function() {
      self.isStarted = true;
      ctx.lineWidth = opts.strokeWidth;
      ctx.lineCap = ctx.lineJoin = 'round';
      ctx.strokeStyle = ctx.createPattern(this, 'repeat');
    });
  });
};

module.exports = Lottery;
