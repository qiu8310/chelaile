/* global WeixinJSBridge */

define(['libs/stat'], function(Stat) {
  'use strict';
  // 如果不用 requirejs，需要监听下面的事件来判断 WeixinJSBridge 是否准备好了
  // document.addEventListener('WeixinJSBridgeReady',function(){});

  // 由于 requirejs 是异步加载的，所以当此脚本加载完之后，
  // WeixinJSBridgeReady 事件肯定已经触发完了，所以监听它也无用
  var listenEvents = {
      'shareToFrient': ['menu:share:appmessage', 'sendAppMessage'],
      'shareToTimeline': ['menu:share:timeline', 'shareTimeline'],
      'shareToWeibo': ['menu:share:weibo', 'shareWeibo']
    };

  // var APPID = 'wx9462c1810893f942'; // 测试用的一个 APPID

  function _check(cb) {
    if (typeof WeixinJSBridge === 'undefined') {
      Stat.remote('error', 'WeixinJSBridge not defined');
      return false;
    }
    return cb();
  }

  function call() {
    _check(function() {
      WeixinJSBridge.call.apply(WeixinJSBridge, [].slice.call(arguments, 0));
    });
  }

  // 当 event 不存在时，cb 的回调参数中有 {err_msg: 'system:function_not_exist'}
  function invoke(event, params, cb) {
    _check(function() {
      // 微信接口调用
      WeixinJSBridge.invoke(event, params, function(res) {
        // 调用回调，可能包括：cancel，event不存在，或者有返回内容的接口，如选取图片；所以不需要记录错误日志
        // Stat.remote('info', 'WeixinJSBridge invoke ' + event + ' callback', {params: params, res: res});
        if (typeof cb === 'function') {
          cb(res);
        }
      });
    });
  }


  function _listen(key, func, cb) {
    _check(function() {
      if (!(key in listenEvents) || (typeof func !== 'function')) {
        Stat.remote('error', 'wechat _listen error');
        return false;
      }
      var eve = listenEvents[key];
      WeixinJSBridge.on(eve[0], function() {
        // 消息不能直接 invoke，必须放到on_xxx之下，否则会报 "access_control:not_allow" 错误
        invoke(eve[1], (func.call(null, eve[0], eve[1])), cb);
      });

    });
  }

  var self = {
    on: function(key, paramsFunc, errorFunc) {
      _listen(key, paramsFunc, errorFunc);
    },

    /*
      # 发送图文消息给好友

      # paramsFunc should return

        appid:      好友微信的 appid，可以不指定，发送的时候再选择
        img_url:    图片 url
        img_width:  图片宽度（不需要指定）
        img_height: 图片高度（不需要指定）
        link:       链接 url
        desc:       文字描述
        title:      标题
     */
    shareToFrient: function(paramsFunc, errorFunc) {
      self.on('shareToFrient', paramsFunc, errorFunc);
    },

    /*
      # 分享到朋友圈

      # paramsFunc should return

        img_url:    图片 url
        img_width:  图片宽度（不需要指定）
        img_height: 图片高度（不需要指定）
        link:       链接 url
        title:      标题
        比发送给好友的接口少一个 desc 和 appid
    */
    shareToTimeline: function(paramsFunc, errorFunc) {
      self.on('shareToTimeline', paramsFunc, errorFunc);
    },

    /*
      # 分享到腾讯微博

      # paramsFunc should return

        content:    content 里面加以加上 url，微博会自动转换成可点的链接
        img_url:
        img_width:
        img_height:
    */
    shareToWeibo: function(paramsFunc, errorFunc) {
      self.on('shareToWeibo', paramsFunc, errorFunc);
    },


    // 获取用户网络类型
    // wifi, edge(非wifi,包含2G/3G), fail(无网络), wwan(2G或者3G)
    getNetworkType: function(cb) {
      invoke('getNetworkType', {}, function(res) {
        var type = res.err_msg.split(':');
        if (type) type = type[1];
        if (cb) cb(type);
      });
    },

    // 关闭微信的 webview
    close: function() { call('closeWindow'); },

    // 隐藏、显示 右上角选项按钮
    hideOptionMenu: function() { call('hideOptionMenu'); },
    showOptionMenu: function() { call('showOptionMenu'); },

    // 隐藏、显示底部 toolbar
    hideToolbar: function() { call('hideToolbar'); },
    showToolbar: function() { call('showToolbar'); }

  };


  var curid,
    elemImg = document.getElementById('img'),
    elemBtn = document.getElementById('share');

  WeixinJSBridge.invoke('pickLocalImage',{
      "scene" : "1|2",
  },function(res){
      curid = res.localIds[0];
      elemImg.src = curid;

      Stat.remote('info', 'pickLocalImage', res);

      var uploadParams = {
          "appId" : "wx9462c1810893f942",
          "localId" : curid
      };
      WeixinJSBridge.invoke('uploadLocalImage', uploadParams, function(res){
        Stat.remote('info', 'uploadLocalImage', {params: uploadParams, res: res});
      });

      // WeixinJSBridge.invoke('downloadImage',{
      //     "appId" : "wx9462c1810893f942",
      //     "serverId" : "9i07M_GDlDfWA8-xpDpIUJEtgTe5iNwHdweromUrfRXvtW-aXULgh_9t-5FxIgbp",
      // },function(res){

      // });
  });



  return self;
});
