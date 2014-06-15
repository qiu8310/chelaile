require.config({
    baseUrl: '../scripts/'
});


require(['libs/dialog'], function(Dialog) {
  'use strict';
  // 刮奖
  function lottery() {
    // 变量
    var G = {},
      canvas = document.getElementById('lottery'),
      container = canvas.parentNode,
      ctx = canvas.getContext('2d'),
      canvasWidth =  520,
      canvasHeight = 300,
      lineWidth = 40,
      mouseDown = false,
      start = false,
      prizeImgSrc = '../images/archive/lottery/prize.png',
      maskImgSrc = '../images/archive/lottery/mask.png';

    G.callback = null; // 刮奖完成的回调

    // 将 canvas 化成 13 * 7 的一个矩形
    // 去掉第 0、4、5、6行，第0、1、2、3、9、10、11、12列
    // 剩下的走过了就算括完了
    var ROWS;
    var MARK_COUNT;
    function mark(local) {
      var row, col;
      row = Math.round(local.y/lineWidth);
      col = Math.round(local.x/lineWidth);
      if (!ROWS[row]) {
        ROWS[row] = [];
      }

      if (ROWS[row].indexOf(col) < 0) {
        ROWS[row].push(col);
        MARK_COUNT++;
      }
    }

    // 判断是否括出了奖品
    function isFinish() {
      return MARK_COUNT/91 >= 0.5;
      // return ROWS['1'].length === 5 && ROWS['2'].length === 5 && ROWS['3'].length === 5;
    }


    // 加载图片
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
        ctx.moveTo(x+0.01, y);
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

      var offset = 260 / canvasWidth;

      // 用了 fixed 定位，所以加上下面这行！
      pageY = pageY - (document.body.scrollTop || 0);
      return { 'x':(pageX - ox) / offset, 'y': (pageY - oy) / offset };
    }



    function setup(cb) {

      // 初始化
      container.style.width = canvasWidth / 2 + 'px'; // 为了支持 retina 屏
      container.style.height = canvasHeight / 2 + 'px';
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      G.callback = cb;
      ROWS = {};
      MARK_COUNT = 0;

      ctx.width = ctx.width; // clear canvas

      // 设置 cover
      loadImg(maskImgSrc, function() {
        ctx.drawImage(this, 0, 0, canvasWidth, canvasHeight);

        // 加载奖品图片
        loadImg(prizeImgSrc, function() {
          start = true;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = ctx.lineJoin = 'round';
          ctx.strokeStyle = ctx.createPattern(this, 'repeat');
        });
      });
    }



    function mousedownHandler(e) {
      var local = getLocalCoords(canvas, e);
      if (!start) {
        Dialog.alert('请稍等，资源加载中');
        return ;
      }
      if (local.x < 0 || local.y < 0 || local.x > canvasWidth || local.y > canvasHeight) {
        return false;
      }
      scratch(ctx, local.x, local.y, true);
      mark(local);
      mouseDown = true;
      e.preventDefault();
      return false;
    }
    function mousemoveHandler(e) {
      if (!mouseDown) { return true; }
      var local = getLocalCoords(canvas, e);
      scratch(ctx, local.x, local.y);
      mark(local);
      e.preventDefault();
      return false;
    }
    function mouseupHandler(e) {
      if (mouseDown) {
        if (isFinish()) {
          start = false;
          if (typeof G.callback === 'function') {
            G.callback();
          }
        }
        mouseDown = false;
        e.preventDefault();
        return false;
      }
      return true;
    }
    // 事件监听
    canvas.addEventListener('mousedown', mousedownHandler, false);
    canvas.addEventListener('touchstart', mousedownHandler, false);
    window.addEventListener('mousemove', mousemoveHandler, false);
    window.addEventListener('touchmove', mousemoveHandler, false);
    window.addEventListener('mouseup', mouseupHandler, false);
    window.addEventListener('touchend', mouseupHandler, false);
    window.addEventListener('touchcancel', mouseupHandler, false);

    return { setup: setup };
  }

  var Game = lottery();
  Game.setup(function() {
    Dialog.alert('over');
  });

});
