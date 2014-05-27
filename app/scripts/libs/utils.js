define(function() {
  /**
   *  函数工具集
   */

  'use stricts';

  // 用于 escape html 字符的 DOM，避免频繁创建
  var _escape_html_elem = document.createElement('div');

  var self = {
    _: function(selector, ctx) {
      return (ctx || document).querySelector(selector);
    },

    __: function(selector, ctx) {
      return [].slice.call((ctx || document).querySelectorAll(selector));
    },

    /**
     *  escape html
     */
    escapeHTML: function(str) {
      var text = document.createTextNode(str);
      _escape_html_elem.appendChild(text);
      return _escape_html_elem.innerHTML;
    },


    /**
     *  设置或获取元素的样式，支持 CSS3
     */
    css: function(elem, key, val) {
      var style,
        t;

      style = typeof val === 'undefined'
          ? window.getComputedStyle(elem, null)
          : elem.style;

      if (!(key in style)) {
        ['Webkit', 'O', 'Moz', 'ms'].forEach(function (prefix) {
          t = prefix + key.charAt(0).toUpperCase() + key.substr(1);
          if (t in style) key = t;
        });
      }

      return typeof val === 'undefined'
          ? style[key]
          : (style[key] = val);
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
