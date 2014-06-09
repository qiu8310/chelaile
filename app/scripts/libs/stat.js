define(['libs/env'], function(Env) {

  'use strict';
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

      if (typeof opt_label !== 'string') opt_label = undefined;
      if (typeof opt_value !== 'number') opt_value = undefined;

      if (myga && myga.push && Env.isOnline) {
        myga.push(['_trackEvent', category, action, opt_label, opt_value]);
      }

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
      if (typeof msg !== 'undefined') url += '&msg=' + encodeURIComponent(msg);
      if (typeof data !== 'undefined') url += '&data=' + encodeURIComponent(JSON.stringify(data));

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

      Stat.log(type, 'remote message', msg, data, true);

    }
  };

  // 本地调试
  Stat.local = {};

  function _log(elem, msg, append) {
    if (/\bdebug=true\b/i.test(location.search)) {
      var key = elem.innerText ? 'innerText' : 'textContent';
      if (append || append === undefined) elem[key] = elem[key] + '\r\n' + msg;
      else elem[key] = msg;
    }
  }

  var wrap = function(key) {
    var debug = document.querySelector('.debug');
    if (!debug) {
      debug = document.createElement('div');
      debug.className = 'debug';
      document.body.appendChild(debug);
    }
    var elem = document.createElement('div');
    elem.className = key;
    debug.appendChild(elem);

    return function() {
      var args = [].slice.call(arguments, 0);
      var msg = [], append = true;

      if (typeof args[args.length - 1] === 'boolean') {
        append = args.pop();
      }

      args.forEach(function(arg) {
        if (typeof arg === 'object') {
          try { arg = JSON.stringify(arg);
          } catch(e) { arg = arg.toString(); }
        }
        msg.push(arg);
      });

      _log(elem, msg.join(', '), append);
    };
  };
  ['success', 'warning', 'log', 'info', 'error'].forEach(function(key) {
    Stat.local[key] = wrap(key);
  });


  // 反馈错误到服务器
  window.onerror = function (msg, src, line) {
    if ( !G.onbeforeunload ) {

      // Safari 返回的是一个对象
      if (typeof msg === 'object') {
        var eve = msg;
        line = eve.line;
        msg = eve.message ? (eve.name + ': ' + eve.message) : eve.toString();
      }

      Stat.log('error', 'appevent', msg, {
        url: location.href,
        src: src,
        line: line,
        ua: navigator.userAgent
      });
    }
    return true;
  };
  window.onbeforeunload = function () { G.onbeforeunload = true; };

  return Stat;
});
