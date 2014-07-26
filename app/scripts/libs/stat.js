/* jshint -W020 */
/* global _gaq */
if (typeof _gaq === 'undefined') {
  _gaq = [];
}

'use strict';


var Env = require('./env');


// 要确保加了 GA 统计
var myga = _gaq, G = {}, Stat;

Stat = {
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

  gaTrack: function(category, action, opt_label, opt_value) {

    var cb = arguments[arguments.length - 1];

    if (typeof opt_label !== 'string') {
      opt_label = undefined;
    }
    if (typeof opt_value !== 'number') {
      opt_value = undefined;
    }

    if (myga && myga.push && Env.isOnline) {
      myga.push(['_trackEvent', category, action, opt_label, opt_value]);
    }

    Stat.local.info('GA#_trackEvent ' + category + ' ' + action);

    if (typeof cb === 'function') {
      // time is money
      if (myga && myga.push) {
        setTimeout(cb, 200);
      } else {
        cb();
      }
    }
  },

  /**
   *  记录日志
   *  data & from is must, others is optial
   *  http://fcbst.sinaapp.com/log.php?time=&msg=string&data={}from=&type=[error/success/info/warning]
   *
   *  查看日志
   *  http://fcbst.sinaapp.com/logs.php
   */
  log: function(type, category, msg, data, forceRemote) {

    var url = 'http://fcbst.sinaapp.com/log.php?from=' + encodeURIComponent(category) + '&type=' + encodeURIComponent(type);
    if (typeof msg !== 'undefined') {
      url += '&msg=' + encodeURIComponent(msg);
    }
    if (typeof data !== 'undefined') {
      url += '&data=' + encodeURIComponent(JSON.stringify(data));
    }

    if (Env.isOnline || forceRemote) {
      (new Image()).src = url + '&_=' + Date.now();
    }

    var logMsg = 'Stat#log:\n Category [%s]\n Msg [%s]\n Data [%o]';
    console[(console[type] ? type : 'log')](logMsg, category, msg, data);
  },

  /**
   *  方便远程调试
   */
  remote: function(type, msg, data) {

    data = data || {};
    data.url = location.href;
    data.ua = navigator.userAgent;

    Stat.log(type, 'remote-message', msg, data, true);
  }
};

// 本地调试
// TODO 做个保存日志功能，将日志放到 Localstorage 中，这样页面刷新了还可以看到上次的日志
// TODO 字符串格式化
/*
 debug
 all      1     所有信息
 success  1     成功信息
 info     2     提示
 log      3     日志
 warn     4     警告
 error    5     错误

 如果 debug 指定为 数字，则表示 >= 指定的数字的级别信息都会显示出来
 数字必须大于0，小于或等于0忽略
 */
Stat.local = {};
(function() {
  var debug = (Env.url.params.debug || '0').toString().toLowerCase(), Map = {
      'true' : 1,
      'yes'  : 1,
      all    : 1,
      success: 2,
      info   : 3,
      log    : 4,
      warn   : 5,
      error  : 6
    };

  // 计算出整数级别
  debug = (debug in Map) ? Map[debug] : (parseInt(debug) || 0);


  function _log(elem, msg, append) {
    var key = elem.innerText ? 'innerText' : 'textContent';
    if (append || append === undefined) {
      elem[key] = elem[key] + '\r\n' + msg;
    } else {
      elem[key] = msg;
    }
  }

  var wrap = function(key) {

    var container = document.querySelector('.__debug');
    if (!container) {
      container = document.createElement('div');
      container.className = '__debug';
      (document.getElementById('root') || document.body).appendChild(container);
    }
    var elem = document.createElement('div');
    elem.className = key;
    container.appendChild(elem);

    return function() {
      if (debug < 1 || debug > Map[key]) {
        return false;
      }

      var args = [].slice.call(arguments, 0);
      var msg = [], append = true;

      if (typeof args[args.length - 1] === 'boolean') {
        append = args.pop();
      }

      args.forEach(function(arg) {
        if (typeof arg === 'object') {
          try {
            arg = JSON.stringify(arg);
          } catch (e) { arg = arg.toString(); }
        }
        msg.push(arg);
      });

      _log(elem, msg.join(', '), append);
    };
  };

  for (var key in Map) {
    if (Map[key] < 2) {
      continue;
    }
    Stat.local[key] = wrap(key);
  }
})();

// 反馈错误到服务器
window.onerror = function(msg, src, line) {
  if (!G.onbeforeunload) {

    // Safari 返回的是一个对象
    if (typeof msg === 'object') {
      var eve = msg;
      line = eve.line;
      msg = eve.message ? (eve.name + ': ' + eve.message) : eve.toString();
    }

    Stat.local.error(msg, src, line);

    Stat.log('error', 'js-error', msg, {
      url : location.href,
      src : src,
      line: line,
      ua  : navigator.userAgent
    });
  }
  return true;
};
window.onbeforeunload = function() { G.onbeforeunload = true; };

module.exports = Stat;
