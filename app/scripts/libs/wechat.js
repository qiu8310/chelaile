/* global WeixinJSBridge */

// WeixinJSBridgeReady 事件肯定已经触发完了，所以监听它也无用
var listenEvents = {
  'shareToFrient'  : ['menu:share:appmessage', 'sendAppMessage'],
  'shareToTimeline': ['menu:share:timeline', 'shareTimeline'],
  'shareToWeibo'   : ['menu:share:weibo', 'shareWeibo']
},
    _check_funcs = [];


var Debug = require('./debug');

function _weixinReady() {
  var cb;
  Debug.log('wechat ready');
  while((cb = _check_funcs.shift())) {
    cb();
  }
}
function _check(cb) {
  if (typeof WeixinJSBridge === 'undefined') {
    if (!_check_funcs.length) {
      document.addEventListener('WeixinJSBridgeReady', _weixinReady);
    }
    _check_funcs.push(cb);
  } else {
    cb();
  }
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
      }
    });
  });
}

// 监听 menu 事件
function _listenMenu(key, func, cb) {
  if (!(key in listenEvents) || (typeof func !== 'function')) {
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
  showToolbar    : function() { call('showToolbar'); }


};


module.exports = self;
