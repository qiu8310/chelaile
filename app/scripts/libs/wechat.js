/* global WeixinJSBridge */

define(['libs/stat', 'libs/agent'], function(Stat, Agent) {
  'use strict';
  // 如果不用 requirejs，需要监听下面的事件来判断 WeixinJSBridge 是否准备好了
  // document.addEventListener('WeixinJSBridgeReady',function(){});

  // 由于 requirejs 是异步加载的，所以当此脚本加载完之后，
  // WeixinJSBridgeReady 事件肯定已经触发完了，所以监听它也无用
  var listenEvents = {
      'shareToFrient': ['menu:share:appmessage', 'sendAppMessage'],
      'shareToTimeline': ['menu:share:timeline', 'shareTimeline'],
      'shareToWeibo': ['menu:share:weibo', 'shareWeibo']
    }, _G = {};

  function _check(cb) {
    if (typeof WeixinJSBridge === 'undefined') {
      if (Agent.platform.wechat) {
        Stat.remote('error', 'WeixinJSBridge not defined');
      } else {
        console.error('WeixinJSBridge not defined');
      }

      return false;
    }
    return cb();
  }

  function call() {
    var args = [].slice.call(arguments, 0);
    _check(function() {
      WeixinJSBridge.call.apply(WeixinJSBridge, args);
    });
  }

  function on() {
    var args = [].slice.call(arguments, 0);
    _check(function() {
      WeixinJSBridge.on.apply(WeixinJSBridge, args);
    });
  }


  // 当 event 不存在时，cb 的回调参数中有 {err_msg: 'system:function_not_exist'}
  function invoke(event, params, cb) {
    _check(function() {
      if (typeof params === 'function') {
        cb = params;
        params = {};
      }
      // 微信接口调用
      WeixinJSBridge.invoke(event, params, function(res) {
        // 调用回调，可能包括：cancel，event不存在，或者有返回内容的接口，如选取图片；所以不需要记录错误日志
        if (typeof cb === 'function') {
          cb(res);
        } else if (cb) {
          Stat.remote('info', 'WeixinJSBridge invoke ' + event + ' callback', {params: params, res: res});
        }
      });
    });
  }

  function _invokeWrap()

  function _listen(key, func, cb) {
    if (!(key in listenEvents) || (typeof func !== 'function')) {
      Stat.remote('error', 'wechat _listen error');
      return false;
    }
    var eve = listenEvents[key];
    on(eve[0], function() {
      // 消息不能直接 invoke，必须放到on_xxx之下，否则会报 "access_control:not_allow" 错误
      invoke(eve[1], (func.call(null, eve[0], eve[1])), cb);
    });
  }

  // progress
  function _progressInit() {
    var cache = _G.progress = _G.progress || {};
    if (cache.inited) return false;
    cache.inited = true;

    cache.events = {
      'onLocalImageUploadProgress': {resource: 'image', operate: 'upload'   },
      'onImageDownloadProgress':    {resource: 'image', operate: 'download' },
      'onVoiceUploadProgress':      {resource: 'voice', operate: 'upload'   },
      'onVoiceDownloadProgress':    {resource: 'voice', operate: 'download' },
      'onVoicePlayEnd':             {resource: 'voice', operate: 'end'      },
      'onVoicePlayBegin':           {resource: 'voice', operate: 'begin'    }
    };
    cache.resources = {};
    cache.operates = {};

    var context,
      handler = function(context) {
        return function() {
          var args = [].slice.call(arguments, 0);
          (cache.contexts || []).forEach(function(env) {
            if (env.resource && env.resource !== context.resource) return ;
            if (env.operate && env.operate !== context.operate) return ;
            if (typeof env.func !== 'function') return ;

            env.func.apply(context, args);
          });
        };
      };


    for (var e in cache.events) {
      context = cache.events[e];
      if (context.resource) cache.resources[context.resource] = true;
      if (context.operate) cache.operates[context.operate] = true;

      on(e, handler(cache.events[e]));
    }
  }

  var self = {
    call: call,
    invoke: invoke,

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
      _listen('shareToFrient', paramsFunc, errorFunc);
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
      _listen('shareToTimeline', paramsFunc, errorFunc);
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
      _listen('shareToWeibo', paramsFunc, errorFunc);
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
    showToolbar: function() { call('showToolbar'); },

    // 微信 5.4 新接口
    // TODO 如何判断支不支持某个接口 ？ // invoke 某个不存在的方法是 callback 会报错

    // image
    pickImages: function() {

    },
    uploadImage: function() {

    },
    downloadImage: function() {

    },

    // voice
    recordVoice: function() {
      // invoke('startRecord')
      // WeixinJSBridge.invoke('startRecord',{
      //       "appId" : "wx9fce185521717341"
      //   },function(res){
      //       curAudioId = res.localId;
      //  });
    },
    playVoice: function() {

    },
    pauseVoice: function() {

    },
    stopVoice: function() {

    },
    uploadVoice: function() {

    },
    downloadVoice: function() {

    },


    // arguments: resource, operate, callback
    on: function() {
      var cache = _G.progress = _G.progress || {};
      if (!cache.inited) _progressInit();

      var context = {}, args = [].slice.call(arguments, 0);
      args.forEach(function(arg) {
        if (typeof arg === 'string') {
          if (cache.resources[arg]) context.resource = arg;
          if (cache.operates[arg]) context.operate = arg;
        } else if (typeof arg === 'function') {
          context.func = arg;
        }
      });

      if (context.func) {
        cache.contexts = cache.contexts || [];
        cache.contexts.push(context);
      }
    },

    // 取消监听
    off: function() {
      var cache = _G.progress = _G.progress || {};
      if (!cache.inited) _progressInit();
      if (cache.contexts.length === 0) return ;
      if (arguments.length === 0) {
        cache.contexts = [];
        return ;
      }

      var context = {};
      [].slice.call(arguments, 0).forEach(function(arg) {
        if (typeof arg === 'string') {
          if (cache.resources[arg]) context.resource = arg;
          if (cache.operates[arg]) context.operate = arg;
        } else if (typeof arg === 'function') {
          context.func = arg;
        }
      });

      for (var i = cache.contexts.length-1; i >= 0; --i) {
        var ctx = cache.contexts[i];
        if (context.resource && ctx.resource !== context.resource) continue;
        if (context.operate && ctx.operate !== context.operate) continue;
        if (context.func && ctx.func !== context.func) continue;

        cache.contexts.splice(i, 1);
      }
    }
  };



  return self;
});
