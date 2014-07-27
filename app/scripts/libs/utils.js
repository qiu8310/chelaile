/**
 *  函数工具集
 */

/*
 其它自带的有用的函数
 1. 插入 html 内容到指定位置
 element.insertAdjacentHTML(position, text);
 position可以为：beforebegin/afterbegin/beforeend/afterend

 2. el.previousElementSibling / el.nextElementSibling： 非空的前 / 后兄弟节点

 3. el.getBoundingClientRect 获取 el 相对于视口的 top、left

 4. document.createNodeIterator  遍历指定的 DOM 节点，详情看 MDN
    类似还有 createTreeWalker
 */

'use strict';

//var reg_word = /^[\w]+$/;

var undef,
    utils,
    value_gettable_form_control_selector = 'input[name], select[name], textarea[name], button[name]',
    reg_trip_bracket = /\[|\]/g,    //  去除中括号 [foo] => foo
    reg_wrap_bracket = /^[\w\-]+\|[^=\[]*/,  // name|foo=bar => name[foo]=bar
    reg_url_keys = /([\w\-]+)|(\[[\w\-]*\])/g; // 匹配 bar[foo][xx][] 这种形式 => [ 'bar', '[foo]', '[xxx]', '[]' ]


function event_listener_delegate_wrap(func, delegateSelector) {

  return function(e) {
    var target = e.target;
    if (utils.matchesSelector(target, delegateSelector)) {
      func.call(target, e);
    }
  };
}

/*
 很多函数我都没写了，像 forEach、indexOf、trim、isArray...
 当作它们默认支持吧
 详情 es5 的浏览器支持情况: http://kangax.github.io/compat-table/es5/
 */
utils = {
  _: function(selector, ctx) {
    if (selector.nodeName) {
      return selector;
    }
    return (ctx || document).querySelector(selector);
  },

  __: function(selector, ctx) {
    return [].slice.call((ctx || document).querySelectorAll(selector));
  },

  /**
   *  对象继承函数 (默认 deep)
   */
  extend: function(obj, other, deep) {
    obj = obj || {};
    var k, i, args = [].slice.call(arguments);

    deep = true;
    if (utils.type(args[0]) === 'boolean') {
      deep = args.shift();
    }

    for (i = 1; i < args.length; ++i) {
      other = args[i];
      if (!other) {
        continue;
      }

      for (k in other) {
        if (other.hasOwnProperty(k)) {
          // 数组不深度复制，避免它被转化成了 Object
          if (deep && utils.type(other[k]) === 'object') {
            obj[k] = utils.extend(obj[k], other[k], deep);
          } else {
            obj[k] = other[k];
          }
        }
      }
    }
    return obj;
  },

  /**
   *  在 URL 上添加新的参数
   */
  appendQuery: function(url, queryString) {
    if (queryString === '') {
      return url;
    }
    var parts = url.split('#');
    return (parts[0] + '&' + queryString).replace(/[&?]{1,2}/, '?') + (parts.length === 2 ? ('#' + parts[1]) : '');
  },


  /**
   *  延迟 delayTime 毫秒去执行 func
   */
  delay: function(delayTime, func) {
    setTimeout(func, delayTime);
  },

  /**
   *
   * @param func
   * @param obj
   * @param funcArgs
   * @returns {*}
   */
  bindFuncToObject: function(func, obj, funcArgs) {
    var bound, args = [].slice.call(arguments);
    func = args[0];
    obj = args[1];
    funcArgs = args.slice(2);

    bound = function() {
      func.apply(obj, funcArgs.concat([].slice.call(arguments)));
    };

    return bound;
  },

  /**
   *  生成随机数
   */
  random: function(min, max) {
    if (max === undef) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  },

  /**
   * 打乱数组顺序
   */
  shuffle: function(arr) {
    var i, rand, value;
    var shuffled = [];
    for (i = 0; i < arr.length; i++) {
      value = arr[i];
      rand = utils.random(i);
      shuffled[i] = shuffled[rand];
      shuffled[rand] = value;
    }
    return shuffled;
  },

  /**
   *  原生的 toString
   */
  toString: function(o) {
    return Object.prototype.toString.call(o);
  },

  /**
   *  获取 JS 对象的类型
   */
  type: function(obj) {
    return utils.toString(obj).replace(/^\[object (.+)\]$/, '$1').toLowerCase();
  },

  /**
   *  监听 input 值变化，变化就执行 cb 函数
   */
  onInputChange: function(inputElem, cb) {
    function change() {
      if (cb) {
        cb(inputElem.value.trim());
      }
    }

    inputElem.addEventListener('change', change, false);
    inputElem.addEventListener('keyup', change, false);
  },

  /**
   * 添加事件监听
   * 支持代理
   */
  on: function(elem, types, delegateSelector, func) {
    elem = utils._(elem);
    if (!elem || !elem.nodeName) {
      return false;
    }

    if (utils.type(delegateSelector) === 'function') {
      func = delegateSelector;
      delegateSelector = null;
    }



    if (delegateSelector) {
      func = event_listener_delegate_wrap(func, delegateSelector);
    }

    types = types.trim().split(/\s+/);
    types.forEach(function(type) {
      elem.addEventListener(type, func, false);
    });
  },

  /**
   * 去除事件监听
   * TODO 暂不支持去除代理
   */
  off: function(elem, types, func) {
    if (!elem) {
      return false;
    }
    types = types.trim().split(/\s+/);
    types.forEach(function(type) {
      elem.removeEventListener(type, func, false);
    });
  },

  /**
   * {} => foo[aa]=aa&foo[bb]=bb&bar[]=cc&bar[]=dd
   * @param obj
   */
  objectToQuery: function(obj, notJoin) {
    var i, name, val, rtn = [];

    var replace = function(w) { return w.replace('|', '[') + ']'; };

    for (name in obj) {
      if (obj.hasOwnProperty(name)) {
        val = obj[name];

        switch (utils.type(val)) {
          case 'object':
            var parts = utils.objectToQuery(val, true);
            for (i = 0; i < parts.length; i++) {
              rtn.push([name, parts[i]].join('|').replace(reg_wrap_bracket, replace));
            }
            break;
          case 'array':
            for (i = 0; i < val.length; i++) {
              rtn.push(name + '[]=' + encodeURIComponent(val[i].toString()));
            }
            break;
          default:
            rtn.push(name + '=' + encodeURIComponent(val));
        }
      }
    }
    return notJoin ? rtn : rtn.join('&');
  },

  /**
   * foo[aa]=aa&foo[bb]=bb&bar[]=cc&bar[]=dd
   *  =>
   * {
     *   foo: {
     *     aa: 'aa',
     *     bb: 'bb'
     *   },
     *   bar: ['cc', 'dd']
     * }
   * @param str
   */
  objectifyQuery: function(str) {
    var data = {};
    str.split('&').forEach(function(pair) {
      var name, val, matches, i, mat, nextMat;
      pair = pair.split('=');
      if (pair.length !== 2) {
        return;
      }

      name = decodeURIComponent(pair[0]);
      val = decodeURIComponent(pair[1]);

      matches = name.match(reg_url_keys);

      var obj = data; // 引用
      for (i = 0; i < matches.length; i++) {
        mat = matches[i].replace(reg_trip_bracket, '');
        nextMat = matches[i + 1];
        if (!nextMat) {
          obj[mat] = val; // 末端
          break;
        } else if (nextMat === '[]') {
          if (obj[mat] === undef) {
            obj[mat] = [];
          }
          obj[mat].push(val); // 末端
          break;
        } else if (nextMat.charAt(0) === '[') {
          if (obj[mat] === undef) {
            obj[mat] = {};
          }
          obj = obj[mat];
        }
      }
    });

    return data;
  },


  /**
   * 获取 elemForm 中的所有表单的值
   *
   * 注意：浏览器在提交 form 时，如果有 radio 或 checkbox 没有选中是，就不会提交上去它们对应的 key
   *
   */
  objectifyForm: function(elemForm) {
    var data = [];
    elemForm = utils._(elemForm);

    // 自定义的组件通过 <input type="hidden"> 来实现
    utils.__(value_gettable_form_control_selector, elemForm).forEach(function(elem) {
      var name, val, type;
      name = elem.name;
      val = elem.value;
      type = elem.type;

      name = encodeURIComponent(name);
      val = encodeURIComponent(type === 'password' ? val : val.trim());

      if (type !== 'radio' && type !== 'checkbox' || elem.checked) {
        data.push(name + '=' + val);
      }

    });

    return utils.objectifyQuery(data.join('&'));

  },

  objectFillForm: function(obj, elemForm) {
    elemForm = utils._(elemForm);

    var data = {};
    utils.objectToQuery(obj, true).forEach(function(encoded_name_val_pair) {
      var name, val;
      val = encoded_name_val_pair.split('=');
      name = decodeURIComponent(val[0]);
      val = decodeURIComponent(val[1]);
      data[name] = val;
    });
    utils.__(value_gettable_form_control_selector, elemForm).forEach(function(elem) {
      var name = elem.name,
          type = elem.type;
      if (name in data) {
        if (type !== 'radio' && type !== 'checkbox') {
          elem.value = data[name];
        } else {
          elem.checked = elem.value === data[name];
        }
      }
    });

  },

  /**
   *  获取或设置 elem 内的文本
   */
  elemText: function(elem, text) {
    var k = elem.textContent ? 'textContent' : 'innerText';
    return text === undef ? elem[k] : elem[k] = text;
  },

  /**
   *  判断 elem 是否包含子元素 child
   */
  contains: function(elem, child) {
    return elem !== child && elem.contains(child);
  },

  /**
   * 查看 elem 是否能匹配 selector
   * @param elem
   * @param selector
   * @returns {*}
   */
  matchesSelector: function(elem, selector) {
    return (elem.matches ||
        elem.matchesSelector ||
        elem.msMatchesSelector ||
        elem.mozMatchesSelector ||
        elem.webkitMatchesSelector ||
        elem.oMatchesSelector).call(elem, selector);
  },

  /**
   *  清空 elem 下的 DOM
   */
  emptyDOM: function(elem) {
    elem.innerHTML = '';
  },

  removeDOM: function(elem) {
    elem.outerHTML = '';
  },

  offsetToViewport: function(elem) {
    return elem.getBoundingClientRect();
  },

  offsetToBody: function(elem) {
    var rect = elem.getBoundingClientRect();
    return {
      top : rect.top + document.body.scrollTop,
      left: rect.left + document.body.scrollLeft
    };
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
   *  将 字符串 编译成 DOMs
   */
  parseHTML: function(str, single) {
    var el = document.createElement('div');
    el.innerHTML = str;
    return single === false ? el.children : el.firstChild;
  },

  /**
   *  用 obj 去渲染 tpl
   *
   *  quick_render  => 快速渲染，不使用 条件和循环替换方法，默认为 true
   *  escape_html   => escape obj 中的 value，默认为 true
   */
  render: function(tpl, obj, quick_render, escape_html) {
    escape_html = escape_html === undef ? true : !!escape_html;
    quick_render = quick_render === undef ? true : !!quick_render;

    if (Array.isArray(obj)) {
      var rtn = '';
      obj.forEach(function(item) {
        rtn += utils.render(tpl, item, quick_render, escape_html);
      });
      return rtn;
    }

    // 替换单个单词 #{word}
    tpl = tpl.replace(/#\{([\w\-]+)\}/g, function(word, match) {
      return (match in obj) ? (escape_html ? utils.escapeHTML(obj[match]) : obj[match]) : '';
    });

    if (!quick_render) {
      // 条件替换 #{&boolean ? str_1 : str_2}
      tpl = tpl.replace(/#\{&([\w\-_]+)\s*\?\s*([^:]*?)\s*:\s*([^\}]*?)\s*\}/g, function(_, key, tplTrue, tplFalse) {
        return obj[key] ? tplTrue : tplFalse;
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
    var style, t;

    style = val === undef ? window.getComputedStyle(elem, null) : elem.style;

    if (!(key in style)) {
      ['Webkit', 'O', 'Moz', 'ms'].forEach(function(prefix) {
        t = prefix + key.charAt(0).toUpperCase() + key.substr(1);
        if (t in style) {
          key = t;
        }
      });
    }

    return val === undef ? style[key] : (style[key] = val);
  },

  /**
   *  取模
   */
  circle: function(index, length) {
    return (length + (index % length)) % length;
  }

};

module.exports = utils;

