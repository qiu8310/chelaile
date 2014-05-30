define(function() {
  /**
   *  一个简单的 dialog 程序
   *    // opts:  closeOnMask => 在 mask 上点击是否关闭
   *    var d = new Dialog(selector or element, opts)
   *    d.close(), d.open()
   *
   *  如果使用 Dialog.confirm、Dialog.alert、Dialog.tpl：
   *    就需要使用 dialog、dialog-confirm、dialog-alert、btn、btn-sure、btn-cancel 样式
   *
   */
  'use strict';

  function each (arr, cb) {var i,l; for (i=0,l=arr.length; i<l; ++i) cb(arr[i], i); }

  var MASK_CLASS_NAME = '__dialog-mask',
    LOCK_CLASS_NAME = '__dialog-lock';

  var htmlElem = document.documentElement,
    dialogCount = 0,
    bodyElem = document.body;

  function Dialog(selector, opts) {
    opts = opts || {};
    opts.closeOnMask = typeof opts.closeOnMask === 'undefined' ? true : !!opts.closeOnMask;

    var container, self = this;
    container = selector.nodeType ? selector : document.querySelector(selector);

    // 指定的 dialog 不存在
    if (!container) throw new Error('Dialog(' + selector + ') not exist');

    // 创建 mask
    var mask = container.parentNode, style;
    if (!mask || !mask.classList.contains(MASK_CLASS_NAME)) {
      mask = document.createElement('div');
      mask.classList.add(MASK_CLASS_NAME);

      mask.appendChild(container);
      bodyElem.appendChild(mask);
    }

    if (opts.closeOnMask) {
      mask.addEventListener('click', function(e) {
        if (e.target.classList.contains(MASK_CLASS_NAME)) {
          self.close();
        }

      }, false);
    }

    // 计算出 dialog 高度
    container.style.display = 'block';
    mask.style.display = 'block';
    var compuStyle = window.getComputedStyle(container);
    var height = compuStyle.height;

    // 隐藏 container 和 mask
    container.style.display = 'none';
    mask.style.display = 'none';

    container.style.height = height;
    each(['left', 'top', 'right', 'bottom'], function(key) { container.style[key] = '0'; });

    this.container = container;
    this.mask = mask;
    this.isOpened = false;
  }

  Dialog.prototype = {
    getContainer: function() {
      return this.container;
    },
    open: function() {
      if (!this.isOpened) {
        this.container.style.display = 'block';
        this.mask.style.display = 'block';
        dialogCount++;
        htmlElem.classList.add(LOCK_CLASS_NAME);
      }
      this.isOpened = true;
      return this;
    },
    close: function(destory) {
      if (this.isOpened) {
        this.container.style.display = 'none';
        this.mask.style.display = 'none';
        dialogCount--;
        if (dialogCount === 0) {
          htmlElem.classList.remove(LOCK_CLASS_NAME);
        }
        if (this.mask && (typeof destory === 'undefined' || destory)) {
          this.mask.parentNode.removeChild(this.mask);
          this.container = null;
          this.mask = null;
        }
      }
      this.isOpened = false;
      return this;
    }
  }


  // 加几个静态方法
  // Dialog.confirm(msg, callback, opts)
  // Dialog.alert(msg, callback, opts)
  // Dialog.tpl(tpl)

  var tpl = '<div class="content"><p class="msg">{msg}</p></div><div class="btns">{btns}</div>';


  function setup(msg, cb, opts, div, btns) {
    var html = tpl.replace('{msg}', msg);

    // 调换 cb 和 opts 顺序
    if (typeof cb !== 'function') {
      var t = cb;
      cb = opts
      opts = t;
    }
    opts = opts || {};
    opts.btns = opts.btns || btns;

    // 获取 btns 样式
    var key, btnsHtml = '';
    for (key in opts.btns) {
      btnsHtml += '<a href="" data-key="'+key+'" class="btn btn-'+key+'">'+opts.btns[key]+'</a>';
    }
    html = html.replace('{btns}', btnsHtml);
    div.innerHTML = html;
    div.style.display = 'none';

    bodyElem.appendChild(div);


    var dialog = new Dialog(div, opts);

    // 监听事件
    for (key in opts.btns) {
      div.querySelector('.btn-' + key).addEventListener('click', function(e) {
        var cbReturn;
        if (typeof cb === 'function') {
          var key = e.target.getAttribute('data-key');
          if (key === 'sure') {
            cbReturn = cb(true);
          } else if (key === 'cancel') {
            cbReturn = cb(false);
          } else {
            cbReturn = cb(key);
          }
        }

        if (cbReturn !== false) {
          dialog.close();
        }

        e.preventDefault();
      });
    }

    dialog.open();
    return dialog;
  }

  function confirmDialog(msg, cb, opts) {
    var div = document.createElement('div');
    div.classList.add('dialog');
    div.classList.add('dialog-confirm');

    var btns = {'sure': '确定', 'cancel': '取消'};

    return setup(msg, cb, opts, div, btns);
  }

  function alertDialog(msg, cb, opts) {
    var div = document.createElement('div');
    div.classList.add('dialog');
    div.classList.add('dialog-alert');

    var btns = {'sure': '确定'};
    return setup(msg, cb, opts, div, btns);
  }

  Dialog.confirm = confirmDialog;
  Dialog.alert = alertDialog;
  Dialog.tpl = function(tpl, className) {
    var div = document.createElement('div');
    div.className = 'dialog ' + (className ? className : '');
    div.innerHTML = tpl;
    var dialog = new Dialog(div);
    return dialog.open();
  }

  return Dialog;

});
