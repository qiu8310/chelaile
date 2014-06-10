define(function() {
  /**
   *  函数工具集
   */

  'use strict';

  //var reg_word = /^[\w]+$/;

  /*
    很多函数我都没写了，像 forEach、indexOf、trim、isArray...
    当作它们默认支持吧
    详情 es5 的浏览器支持情况: http://kangax.github.io/compat-table/es5/
  */
  var self = {
    _: function(selector, ctx) {
      return (ctx || document).querySelector(selector);
    },

    __: function(selector, ctx) {
      return [].slice.call((ctx || document).querySelectorAll(selector));
    },

    /**
     *  一个简单的对象继承函数
     */
    extend: function(obj, other) {
      if (arguments.length < 2) return arguments[0];
      for (var k, i = 1; i < arguments.length; ++i) {
        other = arguments[i];
        for (k in other) {
          // 不是深复制！
          obj[k] = other[k];
        }
      }
      return obj;
    },

    /**
     *  在 URL 上添加新的参数
     */
    appendQuery: function(url, query) {
      if (query === '') return url;
      var parts = url.split('#');
      return (parts[0] + '&' + query).replace(/[&?]{1,2}/, '?') + (parts.length === 2 ? ('#' + parts[1]) : '');
    },


    /**
     *  延迟 time 毫秒去执行 func
     */
    delay: function(time, func) {
      setTimeout(func, time);
    },

    /**
     *  生成随机数
     */
    random: function (min, max) {
      if (typeof max === 'undefined') {
        max = min;
        min = 0;
      }
      return min + Math.floor(Math.random() * (max - min + 1));
    },

    /**
     * 打乱数组顺序
     */
    shuffle: function (arr) {
      var rand, value;
      var shuffled = [];
      for (var i = 0; i < arr.length; i++) {
        value = arr[i];
        rand = self.random(i);
        shuffled[i] = shuffled[rand];
        shuffled[rand] = value;
      }
      return shuffled;
    },

    toString: function(o) {
      return Object.prototype.toString.call(o);
    },

    /**
     *  监听 input 值变化，变化就执行 cb 函数
     */
    onInputChange: function(inputElem, cb) {
      function change() {
        if (cb) cb(inputElem.value.trim());
      }
      inputElem.addEventListener('change', change, false);
      inputElem.addEventListener('keyup', change, false);
    },

    /**
     *  escape html
     *  另一种方案是正则替换，但这种更快点
     */
    escapeHTML: function(str) {
      var elem = document.createElement('div');
      var text = document.createTextNode(str);
      elem.appendChild(text);
      return elem.innerHTML;
    },

    /**
     *  用 obj 去渲染 tpl
     *
     *  quick_render  => 快速渲染，不使用 条件和循环替换方法，默认为 true
     *  escape_html   => escape obj 中的 value，默认为 true
     */
    render: function(tpl, obj, quick_render, escape_html) {
      escape_html = typeof escape_html === 'undefined' ? true : !!escape_html;
      quick_render = typeof quick_render === 'undefined' ? true : !!quick_render;

      // 替换单个单词 #{word}
      tpl = tpl.replace(/#\{([\w\-_]+)\}/g, function(word, match) {
        return (match in obj) ? (escape_html ? self.escapeHTML(obj[match]) : obj[match]) : '';
      });

      if (!quick_render) {
        // 条件替换 #{&boolean ? str_1 : str_2}
        tpl = tpl.replace(/#\{&([\w\-_]+)\s*\?\s*([^:]*?)\s*:\s*([^\}]*?)\s*\}/g, function(_, key, tplTrue, tplFalse) {
          return obj[key] ? tplTrue : tplFalse;
        });

        // 循环替换 #{&repeat key tpl}， obj[key] 需要是个数组
        tpl = tpl.replace(/#\{&repeat\s+([\w\-_]+)\s+([^\}]*?)\}/g, function(_, key, repeat_tpl) {
           var rtn = '';
          if ((key in obj) && Array.isArray(obj[key])) {
            obj[key].forEach(function(it) {
              rtn += self.render(repeat_tpl, it, true, escape_html);
            });
          }
          return rtn;
        });
      }

      return tpl;
    },


    /**
     *  向文档里添加 CSS 代码
     */
    insertCSSCode: function(code) {
      var s = document.createElement('style');
      s.type = 'text/css';
      s.media = 'screen';
      if (s.styleSheet) {     // for ie
        s.styleSheet.cssText = code;
      } else {                 // for w3c
        s.appendChild(document.createTextNode(code));
      }
      (document.getElementsByTagName('head')[0]).appendChild(s);
    },


    /**
     *  设置或获取元素的样式，支持 CSS3
     */
    css: function(elem, key, val) {
      var style,
        t;

      style = typeof val === 'undefined' ?
          window.getComputedStyle(elem, null) :
          elem.style;

      if (!(key in style)) {
        ['Webkit', 'O', 'Moz', 'ms'].forEach(function (prefix) {
          t = prefix + key.charAt(0).toUpperCase() + key.substr(1);
          if (t in style) key = t;
        });
      }

      return typeof val === 'undefined' ?
          style[key] :
          (style[key] = val);
    },

    /**
     *  取模
     */
    circle: function(index, length) {
      return (length + (index % length)) % length;
    }

  };

  return self;

});
