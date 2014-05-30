(function () {define('libs/utils',[],function() {
  /**
   *  函数工具集
   */

  'use strict';

  var reg_word = /^[\w]+$/;

  var self = {
    _: function(selector, ctx) {
      return (ctx || document).querySelector(selector);
    },

    __: function(selector, ctx) {
      return [].slice.call((ctx || document).querySelectorAll(selector));
    },

    each: function(arr, cb) {
      for (var i = 0; i < arr.length; ++i) {
        cb(arr[i], i);
      }
    },

    indexOf: function(arr, item) {
      if (arr.indexOf) {
        return arr.indexOf(item);
      } else {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i] === item) return i;
        }
        return -1;
      }
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
      if (query == '') return url;
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
      if (max == null) {
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

    trim: function(str) {
      return str.replace(/^\s+|\s+$/g, '');
    },

    /**
     *  监听 input 值变化，变化就执行 cb 函数
     */
    onInputChange: function(inputElem, cb) {
      function change() {
        cb && cb(self.trim(inputElem.value));
      }
      inputElem.addEventListener('change', change, false);
      inputElem.addEventListener('keyup', change, false);
    },

    /**
     *  escape html
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

      if (!quick_render) {
        // 条件替换 #{&boolean ? str_1 : str_2}
        tpl = tpl.replace(/#\{&([\w\-_]+)\s*\?\s*([^:]*?)\s*:\s*([^\}]*?)\s*\}/g, function(_, key, tplTrue, tplFalse) {
          return obj[key] ? tplTrue : tplFalse;
        });

        // 循环替换 #{&repeat key tpl}， obj[key] 需要是个数组
        tpl = tpl.replace(/#\{&repeat\s+([\w\-_]+)\s+([^\}]*?)\}/g, function(_, key, repeat_tpl) {
           var rtn = '';
          if ((key in obj) && self.toString(obj[key]) === '[object Array]') {
            self.each(obj[key], function(it) {
              rtn += self.render(repeat_tpl, it, true, escape_html);
            });
          }
          return rtn;
        });
      }

      // 替换单个单词 #{word}
      tpl = tpl.replace(/#\{([\w\-_]+)\}/g, function(word, match) {
        return (match in obj) ? (escape_html ? self.escapeHTML(obj[match]) : obj[match]) : '';
      });

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

define('libs/lucky-plate',['libs/utils'], function(utils) {

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
      if (callbacks.runStart) callbacks.runStart();
      animate(cards, degree, msecond);

    }
  };
});

define('worldcup/data',[],function() {
  return {
    game_result: {
      woman: '哇塞，#{username}理想的另一半是#{starname}啊，你羡慕吗？',
      man: '哇，#{username}日思夜想的好基友是#{starname}啊，你也来认领一个！'
    },

    stars: {
      '01': {
        nick: '球王',
        name: '贝利',
        desc: '世界级足球偶像，拥有三届FIFA世界杯冠军的骄人战绩，无可超越的足球天才。'
      },
      '02': {
        nick: '外星人',
        name: '罗纳尔多',
        desc: '一个传奇般的球员，来自足球的天堂巴西。给他一双足球鞋，他可以撬动球场。'
      },
      '03': {
        nick: '忧郁王子',
        name: '巴乔',
        desc: '你可曾记得他那湛蓝的双眼和标志性的马尾辫造型？曾经的那个孤独背影，让我们感同什么是痛彻心扉！'
      },
      '04': {
        nick: '金色轰炸机',
        name: '克林斯曼',
        desc: '“德国三驾马车”的排头兵，“日耳曼战车”的突击营，祝福这位曾经的国米战士，感谢他对蓝黑军团所做的一切。'
      },
      '05': {
        nick: '凯撒大帝',
        name: '贝肯鲍尔',
        desc: '世界足球史上的一个奇迹，他被看作是“足球皇帝”；他的名字在联邦德国家喻户晓、人人皆知。'
      },
      '06': {
        nick: '球王',
        name: '马拉多纳',
        desc: '被认为足球史上最优秀亦是最具争议的球员，其盘带技术和突破能力让世人为之惊叹，他是足球场上的“上帝”。'
      },
      '07': {
        nick: '战神',
        name: '巴蒂斯图塔',
        desc: '他进球后张开双臂狂奔，长发随之舞动，呐喊响彻球场。他云集了体育史上一切可以激发雄性荷尔蒙的幻想元素。'
      },
      '08': {
        nick: '罗马王子',
        name: '托蒂',
        desc: '他是罗马城的象征，他是潇洒的舞者，他是执着的斗士！你不看足球，所以你不知道有一种忠诚叫托蒂。'
      },
      '09': {
        nick: '黑天鹅',
        name: '里杰卡尔德',
        desc: '有非常抢眼的方便面头型，“荷兰三剑客”之一，AC米兰王朝的缔造者之一，巴萨走向欧洲之巅的引领者。'
      },
      '10': {
        nick: '乌克兰核弹头',
        name: '舍普琴科',
        desc: '无数个金靴奖，无数个联赛冠军，这是曾经最强大的前锋，他是我们心中的“足球先生”，他是乌克兰的民族英雄。'
      },
      '11': {
        nick: '追风少年',
        name: '欧文',
        desc: '他是1998年世界杯上最清新的一道风，他被誉为英格兰金童，他是欧文，那个在夕阳下奔跑的追风少年！'
      },
      '12': {
        nick: '猎豹',
        name: '埃托奥',
        desc: '喀麦隆藉足球运动员，嗅觉敏锐，速度犹如猎豹，曾三次获得欧冠冠军，四次获得非洲足球先生。'
      },
      '13': {
        nick: '魔兽',
        name: '德罗巴',
        desc: '他是顶级后卫的梦魇，灵敏的门前嗅觉，果断的临门一脚，惊人的爆发力，“魔兽”之威名扬四海。'
      },
      '14': {
        nick: '万人迷',
        name: '贝克汉姆',
        desc: '他是衣柜里红色的7号球衣，是墙上英俊的英格兰帅哥，是那些年为英格兰流过的遗憾之泪，小贝，青春印记。'
      },
      '15': {
        nick: '小跳蚤',
        name: '梅西',
        desc: '四座金球奖，创造91球年度进球纪录，27岁已为人父的梅西依然在谱写自己的纪录，梅西在路上！'
      },
      '16': {
        nick: '好好先生',
        name: '卡卡',
        desc: '左手是对爱情的忠贞，右手是对上帝的虔诚，他告诉我们青春，教会我们责任。卡卡，世界好好先生。'
      },
      '17': {
        nick: '高富帅',
        name: 'C罗',
        desc: '从04年泪洒赛场的少年到如今君临天下的金球先生，他桀傲刚强，沸反盈天，闪耀在世界之巅！'
      },
      '18': {
        nick: '斑马王子',
        name: '皮耶罗',
        desc: '他身披斑马战袍征战18个赛季，他代表尤文图斯出场705次，打进290球，他是意大利足球史上最伟大最具象征性的球员之一！'
      },
      '19': {
        nick: '罗宾侠',
        name: '范佩西',
        desc: '他拥有一只能拉小提琴的左脚，是欧洲技术型前锋的代表人物，“谁能横刀立马，唯我范大将军”。'
      },
      '20': {
        nick: 'K神',
        name: '克洛泽',
        desc: '两德统一后首位世界杯金靴奖得主，德国历史第一射手，多次获得公平竞赛奖，被国际足联主席布拉特称为“足球圣人”。'
      },
      '21': {
        nick: '小坦克',
        name: '鲁尼',
        desc: '他用一脚惊艳吊射戏耍了希曼，也让全英从此记住了他的名字！鲁尼，他是曼联的新国王。'
      },
      '22': {
        nick: '长颈鹿',
        name: '范德萨',
        desc: '1998年世界杯上小毛驴的冲天一顶让世界知道了这个长颈鹿门神，足球史上最优秀的门将。'
      },
      '23': {
        nick: '大竹杆',
        name: '克劳奇',
        desc: '他是利物浦历史上最高的球员，也是英超目前最高的人。他的脚下技术、控带以及护球能力极强，他是一个增高版的技术型前锋。'
      },
      '24': {
        nick: '指环王',
        name: '劳尔',
        desc: '他是皇家马德里永远的队长，他亲吻戒指的庆祝方式更是一个时代的记忆。'
      },
      '25': {
        nick: '“金童”，“圣婴”',
        name: '托雷斯',
        desc: '7岁遇到现在的妻子，17岁正式交往，从此再没其他女人；他以金童身份出现在人们的视野，年仅19岁成为马德里竞技历史上最年轻队长。'
      },
      '26': {
        nick: '齐祖',
        name: '齐达内',
        desc: '从1996年欧洲杯崭露头角，到1998年世界杯扬名立万，再到2006年世界杯光辉，他遗憾谢幕。'
      }
    }
  }
});

define('libs/dialog',[],function() {
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
    var mask = container.parentNode;
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
  };


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
      cb = opts;
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
    var handler = function(e) {
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
    };
    for (key in opts.btns) {
      div.querySelector('.btn-' + key).addEventListener('click', handler);
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
  };

  return Dialog;

});

define(
  'worldcup/game',['libs/utils', 'libs/lucky-plate', 'worldcup/data', 'libs/dialog'],
  function(utils, LuckyPlate, Data, Dialog) {
  'use strict';

  // 抽奖游戏
  return function(start_callback, share_callback) {
    var CARD_LENGTH = 12;

    var container = utils._('.game'),
      controller = utils._('.lucky-plate .start'),
      nameInput = utils._('#name');

    var stars = Data.stars, keys = [];


    var tpl_result = '<div class="result"><img src="#{avatar}"><p>#{result}</p></div><div class="intro"><h1><span class="star-nick">#{nick}</span>&nbsp;<span class="star-name">#{name}</span></h1><p>#{desc}</p><a href="" class="btn btn-beg-bless">求祝福</a></div>'

    var tpl_share = '<div class="result"><img src="#{avatar}"><p>#{result}</p><p class="from">from 英语流利说</p></div><div class="btns"><a href="" class="btn btn-orange btn-sure">分享</a><a href="" class="btn btn-cancel">取消</a><div>';

    // init
    function initGame() {
      container.style.visibility = 'hidden';
      var key, names, html = [];
      for (key in stars) {
        keys.push(key);
      }
      keys = utils.shuffle(keys).slice(0, CARD_LENGTH);

      utils.each(keys, function(key) {
        html.push('<li><span>' + stars[key]['name'] + '</span></li>')
      });
      utils._('.cards ul', container).innerHTML = html.join('');
      container.style.visibility = 'visible';
    };
    initGame();


    // 抽奖结束
    function end(i) {

        var key = keys[i],
          star = stars[key];
        star.avatar = 'images/stars/' + key + '.png';

        // 表单信息
        var gender = utils._('#woman').checked ? 'woman' : 'man',
          username = utils.trim(nameInput.value);

        // 结果信息
        star.result = utils.render(Data.game_result[gender], {username: username, starname: star.name});

        utils.delay(300, function() {

          controller.classList.remove('disabled');

          // dialog
          var dialog = Dialog.tpl(utils.render(tpl_result, star), 'dialog-game-end');

          // 按钮点击
          utils._('.btn-beg-bless', dialog.getContainer()).addEventListener('click', function(e) {
            dialog.close();
            //initGame();

            // 分享窗口
            dialog = Dialog.tpl(utils.render(tpl_share, star), 'dialog-share');

            // 分享 或 取消
            var container = dialog.getContainer();
            utils._('.btn-cancel', container).addEventListener('click', function(e){
              dialog.close();
              e.preventDefault();
            });
            utils._('.btn-sure', container).addEventListener('click', function(e){
              dialog.close();
              share_callback && share_callback(star.result);
              e.preventDefault();
            });

            e.preventDefault();
          }, false);
        });
    }

    function canGame() {
      return (utils.trim(nameInput.value)).length >= 2;
    }

    function check() {
      if (canGame()) {
        controller.classList.remove('disabled');
      } else {
        controller.classList.add('disabled');
      }
    }

    if (controller) {
      utils.onInputChange(nameInput, check);
      check();

      controller.addEventListener('click', function() {
        controller.classList.add('disabled');

        var stop = Math.round(Math.random() * 13);
        LuckyPlate.run(utils._('.lucky-plate'), stop, {runEnd: end, runStart: start_callback});
      }, false);
    }
  };


});

define('libs/url-parser',[],function() {
  /**
   *  解析 URL 成一个个小部分
   */
  'use strict';

  var param_key_reg = /([-_\w]+)\[([-_\w]*)\]/;
  //  .serialize()
  // 解析  arr[]=aaaa&arr[]=bbbb&obj[xxx]=xxx&obj[yyy]=yyy 这种类型的参数
  function push(name, val, data) {
    if (typeof val !== 'undefined') {
      var matcher = name.match(param_key_reg);
      if (matcher) {
        name = matcher[1];
        if (matcher[2]) {
          data[name] = data[name] || {};
          data[name][matcher[2]] = val;
        } else {
          data[name] = data[name] || [];
          data[name].push(val);
        }
      } else {
        data[name] = val;
      }
    }
  }


  function parseURL(url) {
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
            var ret = {},
                seg = a.search.substr(1).split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                push(s[0], s[1], ret);
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1')
    };
  }

  return parseURL;

});

define('libs/router',['libs/url-parser'], function(parse) {

  'use strict';

  var urlObj = parse(location.href);

  var _path = urlObj.path;
  //  去掉最前的 /
  if (_path.charAt(0) === '/') _path = _path.substr(1);

  // 去掉后缀名
  if (_path.lastIndexOf('.') >= 0) _path = _path.substring(0, _path.lastIndexOf('.'));

  // 首页
  if (_path === '') _path = 'index';


  var _pathMap = {};
  return {
    all: function(callback) {
      return this.on('_all_', callback);
    },
    on: function(path, callback) {
      _pathMap[path] = true;

      if (_path === path || path === '_all_') {
        if ( typeof callback === 'function' ) callback.call(this, _path, urlObj);
      }

      return this;
    },
    other: function(callback) {
      if (!(_path in _pathMap)) {
        if ( typeof callback === 'function' ) callback.call(this, _path, urlObj);
      }
      return this;
    }
  };


});

define('libs/native',[],function() {
  /**
   *  Native app 向 webview 暴露的接口
   *  1、分享到微博、微信等的接口
   *  2、销毁 webview，返回主 app 接口
   *  3、添加课程接口：调用之后会跳到 app 上的课程列表页面上去，同时会把指定的课程添加进来
   */
  'use strict';

  return {
    share: function(url, text) {
      window.location.href = 'lls://share/' + encodeURIComponent(url) + '/' + encodeURIComponent(text);
    },

    back: function() {
      window.location.href = 'lls://back';
    },

    addModule: function(moduleId) {
      window.location.href = 'lls://module/' + moduleId + '/add';
    }
  };
});

define('libs/agent',[],function() {
  /**
   *  当前用户的操作系统
   *    iOS、android、others
   */
  'use strict';

  var
    agent_str = navigator.userAgent,
    agent = {};

  agent.isIOS = /iP(ad|hone|od)/.test(agent_str);
  agent.isAndroid = /Android/i.test(agent_str);
  agent.isOthers = !agent.isIOS && !agent.isAndroid;

  // TODO 放在另一个文件中
  // agent.isInWeChatWebview ;

  return agent;

});

define('libs/partial',[],function() {
  'use strict';



  function partials_each(key, callback) {

    // 不做缓存，防止页面动态更新
    var all = document.querySelectorAll('.' + key);
    if (all && (typeof callback === 'function')) {
      for(var i = 0; i < all.length; ++i) {
        callback.call(all, all[i], i);
      }
    }
    return all;
  }

  return function(key, val) {
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

});

define('libs/storage',[],function() {
  'use strict';

  var Storage = window.localStorage;
  return {
    set: function(key, val) {
      return Storage && (Storage[key] = val);
    },
    get: function(key) {
      return Storage && Storage[key];
    },
    del: function(key) {
      return Storage && Storage.removeItem(key);
    }
  };

});

define('libs/env',[],function() {
  /**
   *  当前的环境:
   *    isStaging   测试环境
   *    isLocal     本地环境
   *    isOnline    线上环境
   */
  'use strict';

  var
    env = {},
    host = location.host;

  // staging 环境
  env.isStaging = host === 'staging.llsapp.com';

  // localhost 经常会带有端口号！
  env.isLocal = host.indexOf('localhost') === 0 || host.indexOf('192.168') === 0;

  env.isOnline = !env.isLocal && !env.isStaging;

  return env;
});

define('libs/ajax',['libs/utils'], function(utils) {

  'use strict';
  var empty = function(){},
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/;


  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false )
      return false
  }
  function ajaxSuccess(data, xhr, settings) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
  }

  var config = {
    type: 'GET',
    beforeSend: empty,
    success: empty,
    error: empty,
    complete: empty,
    xhr: function () {
      return new window.XMLHttpRequest()
    },

    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: false
  };

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function serializeData(options) {
    if (options.processData && options.data && (typeof options.data) != "string") {
      var k, params = [];
      for (k in options.data) {
        params.push(k + '=' + encodeURIComponent(options.data[k]));
      }
      options.data = params.join('&').replace(/%20/g, '+');
    }

    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = utils.appendQuery(options.url, options.data), options.data = undefined
  }


  function ajax(options) {

    var settings = utils.extend({}, config, options || {});

    // 默认使用当前 url
    if (!settings.url) settings.url = window.location.toString()

    serializeData(settings)
    if (settings.cache === false) settings.url = utils.appendQuery(settings.url, '_=' + Date.now())

    var dataType = settings.dataType;

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout;

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest');
    setHeader('Accept', mime || '*/*');

    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0];
      xhr.overrideMimeType && xhr.overrideMimeType(mime);
    }

    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name]);
    xhr.setRequestHeader = setHeader;

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty;
        clearTimeout(abortTimeout);
        var result, error = false;
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings)
          else ajaxSuccess(result, xhr, settings)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings)
      return xhr
    }


    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  return ajax;

});

define('worldcup/api',['libs/env', 'libs/storage', 'libs/ajax'], function(Env, Storage, ajax) {
  'use strict'

  var base, id;
  if (Env.isLocal) {
    base = 'http://192.168.1.198:3000/api/events/activities/';
  } else if (Env.isStaging) {
    base = 'http://staging.llsapp.com/api/events/activities/';
  } else {
    base = 'http://api.llsapp.com/api/events/activities/';
  }

  return function(path, params) {
    params = params || {};
    if (!id) {
      id = Storage.get('activity_id');
    }

    params.url = base + id + path;
    params.type = params.type || 'get';
    params.dataType = params.dataType || 'json';

    params.data = params.data || {};
    // params.data.timestamp = Date.now(); // 我默认开启了 ajax 的 cache，所以这里不用了
    params.data.token = params.data.token || Storage.get('token');

    ajax(params);

    // $.ajax({
    //   url: path,
    //   type: type,
    //   data: params,
    //   dataType: 'json',
    //   success: callback,
    //   error: errCallback
    // });

  };

});

define('libs/stat',[],function() {

  'use strict';
  // 要确保加了 GA 统计

  var ga = _gaq;


  /*
    https://developers.google.com/analytics/devguides/collection/gajs/methods/

    ga.push(['_setCustomVar', index, key, value, scope]);

    index 自定义变量的类别，可以设置的范围是1-5
    name  自定义变量的名称，名称与值相对应。这里设置的内容将出现在自定义变量报告的最高一级。
    value 自定义变量的值，这个值与名称应该成对出现。
          通常一个名称可以对应很多个值。例如:当名称为性别时，对应的值就应该是男，女，两个值。
    scope 自定义变量的范围，可以设置的范围是1-3。
          其中1表示访客级别，2表示会话级别，3表示页面级别。为空时默认表示页面级别。

    Read more:
      https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingCustomVariables?hl=zh-cn
      http://bluewhale.cc/2010-10-07/google-analytics-custom-variables.html#ixzz33AVXiQCU


    trackEvent:

    https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEventTracking#_gat.GA_EventTracker_._trackEvent
  */
  return {
    gaTrack: function(category, action, opt_label, opt_value) {

      var cb = arguments[arguments.length - 1];

      if (typeof opt_label !== 'string') opt_label = undefined;
      if (typeof opt_value !== 'number') opt_value = undefined;

      if (ga && ga.push) {
        ga.push(['_trackEvent', category, action, opt_label, opt_value]);
      }

      if (typeof cb === 'function') {
        // time is money
        if (ga && ga.push) {
          setTimeout(cb, 200);
        } else {
          cb();
        }
      }
    }

  };
});

define('libs/audio-player',[], function() {

  'use strict';


  var AudioPlayer = (function() {
    var _stop_callback,
      player,
      _player_id = '__player_id__',
      _last_control;

    function getPlayer() {
      if (!player) {
        player = document.getElementById(_player_id);

        if (!player) {
          player = document.createElement('audio');
          player.id = _player_id;
          document.body.appendChild(player);

          player.addEventListener('ended', stop, false);
        }
      }
      return player;
    }

    function stop() {
      if (player) {
        player.pause();
      }
      if (_last_control) {
        _last_control.classList.remove('stop');
        _last_control = null;
      }
      if (_stop_callback) {
        _stop_callback.call(null);
      }
    }

    function play(control) {
      getPlayer();
      if (_last_control === control) {
        player.play();
      } else {
        var src = control.getAttribute('data-src');
        if (src) {
          control.classList.add('stop');
          stop();
          player.src = src;
          player.play();
          if (_last_control) {
            _last_control.classList.remove('stop');
          }
        }
      }
      _last_control = control;
    }

    document.addEventListener('click', function(e) {
      var target = e.target, classList = target.classList;
      if (!classList.contains('audio-control') || classList.contains('disabled')) return ;

      if (classList.contains('stop')) {
        stop();
        classList.remove('stop');
      } else {
        play(target);
      }
    }, false);

    return {
      play: play,
      stop: stop,
      onEnd: function(func) {
        _stop_callback = func;
        return this;
      }
    };
  })();


  return AudioPlayer;


});

require.config({
    paths: {
        zepto: '../bower_components/zepto/zepto',
        hammer: '../bower_components/hammerjs/hammer'
    },
    shim: {
        zepto: {
            exports: 'Zepto'
        }
    }
});

require([
    'worldcup/game',
    'libs/utils',
    'libs/router',
    'libs/dialog',
    'libs/native',
    'libs/agent',
    'libs/partial',
    'libs/storage',
    'worldcup/api',
    'libs/stat',
    'libs/audio-player'
], function (
    gameon,
    utils,
    Router,
    Dialog,
    Native,
    Agent,
    partial,
    Storage,
    api,
    Stat,
    AudioPlayer
) {
    'use strict';


    function page(path, urlObj) {
        // 保存 token
        var token = urlObj.params.token,
            act_id = urlObj.params.activity_id;

        token && Storage.set('token', token);
        act_id && Storage.set('activity_id', act_id);

        // 分享过来的页面
        if (urlObj.params.share === 'yes') {
            if (Agent.isIOS) {
                utils._('.download-ios').classList.remove('hidden');
            } else if (Agent.isAndroid) {
                utils._('.download-ios').classList.remove('hidden');
            }
            utils._('.share-ad').classList.remove('hidden');
        }

        // 初始化页面的一些基本信息
        if (Agent.isIOS) {
            // 加上 “此活动与苹果无关声明”
            var gameElem = utils._('#ios-relative');
            if (gameElem) gameElem.classList.add('ios-declare');

            // 苹果系统不需要 header
            var headerElem = utils._('body > header');
            if (headerElem) headerElem.style.display = 'none';
        } else {
            // 有 header 的系统首页的 back 需要使用 Native 的 back，即系统调用
            var backElem = utils._('.header-left a');
            if (backElem) {
                backElem.addEventListener('click', function(e) {
                    if (backElem.classList.contains('back-to-app')) {
                        Native.back();
                    } else {
                        window.history.back();
                    }
                    e.preventDefault();
                }, false);
            }
        }
    }



    // 首页脚本
    function page_index(path, urlObj) {
        // 抽奖游戏
        gameon(
            // 点击了 "开始游戏"
            function() {
                Stat.gaTrack('play_game', 'click', '开始游戏点击');
                api('/lottery', {type: 'POST'});
            },
            // 点击了 "分享"
            function(text) {
                Stat.gaTrack('share', 'click', '分享点击', function() {
                    var url = location.href.split('?').shift() + '?share=yes&activity_id=' + urlObj.params.activity_id + '#game';
                    Native.share(url, text);
                });
            }
        );

        // 状态
        var statuses = [], defaultStatus = 'content_module';
        var statusMap = {
            crowdfunding: 'group',
            content_module: 'normal',
            seckill: 'second'
        }, Act, Event, User;
        for (var k in statusMap) statuses.push(k);


        var MSG = {
            group: {
                confirm: '预购课程会从您账户中扣除60颗流利钻，确认报名？',
                coin: 60
            },
            normal: {
                confirm: '秒杀课程会从您账户中扣除90颗流利钻，确认报名？',
                coin: 90
            },
            second: {
                confirm: '购买课程会从您账户中扣除240颗流利钻，确认报名？',
                coin: 240
            }
        }

        // 请求首页数据
        api('/', {
            success: function(data) {
                Act = data && data.activity;
                User = data && data.user;
                Event = Act.events && Act.events[0] || {};
                var status = Event && utils.indexOf(statuses, Event.type) > -1 ? Event.type : defaultStatus;
                status = statusMap[status];
                Event._status = status;
                console.log(Act, User);
                if (status === 'group') {
                    // 进度条
                    var progress,
                        user_count = parseInt(Event.users_count, 10) || 0,
                        total = 200;
                    progress = (total - user_count) * 100 / total;
                    utils._('.progress .mask').style.width = progress + '%';

                    // 几人报名
                    var dom_title = utils._('.progress .title'),
                        tpl = dom_title.innerText;
                    dom_title.innerText = tpl.replace(/\d+/, user_count);

                    // 已完成比例
                    var dom_finish = utils._('.progress .finish-rate');
                    tpl = dom_finish.innerText;
                    progress = Math.round(user_count * 1000 / total) / 10
                    dom_finish.innerText = tpl.replace(/\d+\%/, progress + '%');
                }
                partial(status);
            },
            error: function(status) {
                Dialog.alert('系统错误，请重试');
            }
        });

        utils._('#btn-group').addEventListener('click', handler, false);
        utils._('#btn-second').addEventListener('click', handler, false);
        utils._('#btn-normal').addEventListener('click', handler, false);

        function handler(e) {
            if (!Act) {
                Dialog.alert('系统错误，请稍后再来');
            } else if (!User) {
                Dialog.alert('您尚末登录');
            } else if (Act.have_content_module) {
                Dialog.alert('您已成功购买', {btns: {cancel: '取消'}});
            } else if (MSG[Event._status]['coin'] > User.coin) {
                Dialog.alert('您的钻石余额不足，请先去充值');
            } else {
                var id = e.target.id.split('-').pop();
                var money = MSG[Event._status]['coin'] / 10;
                var msg = MSG[Event._status]['confirm'];

                Stat.gaTrack('buy_course', 'click', money + '元购买课程');

                Dialog.confirm(msg, function(sure) {
                    if (!sure) return ;
                    api('/' + Event.type, {
                        type: 'POST',
                        success: function() {
                            Stat.gaTrack('buy_course', 'result', money + '元购买课程成功');
                            Act.have_content_module = true;
                            User.coin = User.coin - MSG[Event._status]['coin'];
                            if (Event._status === 'group') {
                                Dialog.alert('预购课程成功！');
                            } else {
                                Native.addModule(Act.content_module_id);
                            }
                        },
                        error: function() {
                            Stat.gaTrack('buy_course', 'result', money + '元购买课程失败');
                            Dialog.alert('系统错误，请稍后再来');
                        }
                    });
                });
            }
            e.preventDefault();
        }

        window.partial = partial;
        window.Dialog = Dialog;
    }

    function page_leaderboard(path, urlObj) {
        api('/rank_list', {
            success: function(data) {
                console.log(data);
            },
            error: function() {}
        });
    }



    // 路由
    Router
        // 所有页面都执行，而且是首先执行
        .all(page)

        // 首页
        .on('index', page_index)

        // 排行榜
        .on('leaderboard', page_leaderboard)

        // 默认也是首页
        .other(page_index);

});

define("main", function(){});

}());