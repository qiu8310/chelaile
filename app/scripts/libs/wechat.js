/* global WeixinJSBridge */


var Stat = require('./stat'), Agent = require('.agent'), Event = require('./event');
// 如果不用 requirejs，需要监听下面的事件来判断 WeixinJSBridge 是否准备好了
// document.addEventListener('WeixinJSBridgeReady',function(){});


// 由于 requirejs 是异步加载的，所以当此脚本加载完之后，
// WeixinJSBridgeReady 事件肯定已经触发完了，所以监听它也无用
var listenEvents = {
  'shareToFrient'  : ['menu:share:appmessage', 'sendAppMessage'],
  'shareToTimeline': ['menu:share:timeline', 'shareTimeline'],
  'shareToWeibo'   : ['menu:share:weibo', 'shareWeibo']
};

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


// 当 eve 不存在时，cb 的回调参数中有 {err_msg: 'system:function_not_exist'}
function invoke(eve, params, cb) {
  _check(function() {
    if (typeof params === 'function') {
      cb = params;
      params = {};
    }
    // 微信接口调用
    WeixinJSBridge.invoke(eve, params, function(res) {
      // 调用回调，可能包括：cancel，eve不存在，或者有返回内容的接口，如选取图片；所以不需要记录错误日志
      if (typeof cb === 'function') {
        cb(res);
      } else if (cb) {
        Stat.remote('info', 'WeixinJSBridge invoke ' + eve + ' callback', {params: params, res: res});
      }
    });
  });
}

/*
 opts = {
 mandatory: [],      // 必填的参数
 def: {},            // 默认的参数
 expect: [],         // 期望的结果，如果没有包含期望的值，会调用 error, 否则 success，也可以是 function
 expectAll: boolean  // true => 要满足所有的 expect,  false => 满足一个 expect 即可，默认 true
 success:  function
 error:    function
 complete: function
 }
 */
function _expect(eve, err_msg) { return (/\s*:\s*ok\b/i).test(err_msg); }
function _invokeWrap(eve, opts, params, outterOpts) {
  params = params || {};
  outterOpts = outterOpts || {};

  var k;
  for (k in outterOpts) {
    opts[k] = outterOpts[k];
  }

  if (opts.def) {
    for (k in opts.def) {
      if (!params[k]) {
        params[k] = opts.def[k];
      }
    }
  }

  if (opts.mandatory) {
    var i, l = opts.mandatory.length;
    for (i = 0; i < l; ++i) {
      if (!(opts.mandatory[i] in params)) {
        throw new Error('Wechat invoke ' + eve + ' absence argument ' + opts.mandatory[i]);
      }
    }
  }

  invoke(eve, params, function(res) {
    var rtnArgs = [].slice.call(arguments, 0);
    var success;

    // not defined
    if (!opts.expect) {
      success = _expect(eve, res.err_msg);

      // is function
    } else if (typeof opts.expect === 'function') {
      success = opts.expect.apply(null, rtnArgs);

      // is string
    } else if (typeof opts.expect === 'string') {
      opts.expect = [opts.expect];
    }

    // is array
    var expectData = {}, expectAll;
    if (opts.expect && opts.expect.length > 0) {
      expectAll = typeof opts.expectAll === 'undefined' ? true : !!opts.expectAll;
      success = expectAll;
      opts.expect.forEach(function(key) {
        expectData[key] = res[key];

        var inRes = (key in res);
        if (inRes && !expectAll) {
          success = true;
        } else if (!inRes && expectAll) {
          success = false;
        }

      });
    }

    if (opts.complete) {
      opts.complete.apply(null, rtnArgs);
    }

    if (success === true && opts.success) {
      if (opts.expect && opts.expect.length > 0) {
        rtnArgs.unshift(expectData);
      }
      opts.success.apply(null, rtnArgs);
    } else if (success === false && opts.error) {
      opts.error.apply(null, rtnArgs);
    }
  });
}

// 监听 menu 事件
function _listenMenu(key, func, cb) {
  if (!(key in listenEvents) || (typeof func !== 'function')) {
    Stat.remote('error', 'Wechat _listenMenu error');
    return false;
  }
  var eve = listenEvents[key];
  on(eve[0], function() {
    // 消息不能直接 invoke，必须放到on_xxx之下，否则会报 "access_control:not_allow" 错误
    var share_data = func.call(null, eve[0], eve[1]);

    // 处理 wechat android bug: 缺少 desc 就无法分享，但 desc 根本没用
    if (key === 'shareToTimeline') {
      share_data.desc = share_data.title;
    }

    invoke(eve[1], share_data, cb);
  });
}

var self = {
  call           : call,
  invoke         : invoke,

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
  shareToFrient  : function(paramsFunc, errorFunc) {
    _listenMenu('shareToFrient', paramsFunc, errorFunc);
  },

  /*
   # 分享到朋友圈

   # paramsFunc should return

   img_url:    图片 url
   img_width:  图片宽度（不需要指定）
   img_height: 图片高度（不需要指定）
   link:       链接 url
   title:      标题

   wechat android bug: 安卓一定要带上 desc 这个字段，但它没用，你可以将它设置成和 title 一样

   比发送给好友的接口少一个 desc 和 appid
   */
  shareToTimeline: function(paramsFunc, errorFunc) {
    _listenMenu('shareToTimeline', paramsFunc, errorFunc);
  },

  /*
   # 分享到腾讯微博

   # paramsFunc should return

   content:    content 里面加以加上 url，微博会自动转换成可点的链接
   img_url:
   img_width:
   img_height:
   */
  shareToWeibo   : function(paramsFunc, errorFunc) {
    _listenMenu('shareToWeibo', paramsFunc, errorFunc);
  },


  // 获取用户网络类型
  // wifi, edge(非wifi,包含2G/3G), fail(无网络), wwan(2G或者3G)
  getNetworkType : function(cb) {
    invoke('getNetworkType', {}, function(res) {
      var type = res.err_msg.split(':');
      if (type) {
        type = type[1];
      }
      if (cb) {
        cb(type);
      }
    });
  },

  // 关闭微信的 webview
  close          : function() { call('closeWindow'); },

  // 隐藏、显示 右上角选项按钮
  hideOptionMenu : function() { call('hideOptionMenu'); },
  showOptionMenu : function() { call('showOptionMenu'); },

  // 隐藏、显示底部 toolbar
  hideToolbar    : function() { call('hideToolbar'); },
  showToolbar    : function() { call('showToolbar'); },

  // 微信 5.4 新接口
  // TODO 如何判断支不支持某个接口 ？ // invoke 某个不存在的方法是 callback 会报错

  // WeixinJSBridge.invoke('scanQRCode',{
  //       "desc" : "这是描述",
  //       "needResult" : 1,  //1，直接返回扫描结果 0，微信处理结果
  //     },function(res){
  //       alert(res.resultStr);
  //     });

  // image
  pickImages     : function(params, opts) {
    if (arguments.length === 1) {
      opts = params;
      params = {};
    }
    _invokeWrap('pickLocalImage', {
      def   : {scene: '1|2'},
      expect: 'localIds'
    }, params, opts);
  },
  uploadImage    : function(params, opts) {
    _invokeWrap('uploadLocalImage', {
      mandatory: ['localId', 'appId'],
      expect   : 'serverId'
    }, params, opts);
  },
  downloadImage  : function(params, opts) {
    _invokeWrap('downloadImage', {
      mandatory: ['serverId'],
      expect   : 'localId'
    }, params, opts);
  },

  // voice
  /*
   params = {
   appId: xxx
   }
   opts = {
   success: function({localId: xxxx}, res) {}
   error: function(res) {}
   complete: function(res) {}
   }
   */
  recordVoice    : function(params, opts) {
    _invokeWrap('startRecord', {
      mandatory: ['appId'],
      expect   : ['localId']
    }, params, opts);
  },
  /*
   params = {
   appId: xxx
   localId: xxx
   }
   opts = {
   complete: function(res) {}
   }
   */
  playVoice      : function(params, opts) {
    _invokeWrap('playVoice', {
      mandatory: ['appId', 'localId']
    }, params, opts);
  },
  pauseVoice     : function(params, opts) {
    _invokeWrap('pauseVoice', {
      mandatory: ['appId', 'localId']
    }, params, opts);
  },
  stopVoice      : function(params, opts) {
    _invokeWrap('stopVoice', {
      mandatory: ['appId', 'localId']
    }, params, opts);
  },
  uploadVoice    : function(params, opts) {
    _invokeWrap('uploadVoice', {
      mandatory: ['appId', 'localId'],
      expect   : 'serverId'
    }, params, opts);
  },
  downloadVoice  : function(params, opts) {
    _invokeWrap('downloadVoice', {
      mandatory: ['appId', 'serverId'],
      expect   : 'localId'
    }, params, opts);
  }
};

Event.wrap(self);

var _oldOn = self.on;
var onEvents = {
  imageupload  : {old: 'onLocalImageUploadProgress'},
  imagedownload: {old: 'onImageDownloadProgress'},
  voiceupload  : {old: 'onVoiceUploadProgress'},
  voicedownload: {old: 'onVoiceDownloadProgress'},
  voiceend     : {old: 'onVoicePlayEnd'},
  voicebegin   : {old: 'onVoicePlayBegin'}
};
function _handlerEvent(key) {
  return function() {
    Stat.local.info('Event: ' + key, arguments[0]);
    self.trigger(key, [].slice.call(arguments, 0));
  };
}
self.on = function(types) {
  types.split(/\s+/).forEach(function(type) {
    var key = type.split('.').shift();
    if ((key in onEvents) && !onEvents[key].inited) {
      onEvents[key].inited = true;
      on(onEvents[key].old, _handlerEvent(key));
    }
  });
  _oldOn.apply(self, [].slice.call(arguments, 0));
};

if (Agent.platform.wechat) {
  self.supported = true;
}

module.exports = self;
