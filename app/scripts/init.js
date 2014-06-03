define([
    'libs/utils',
    'libs/Agent',
    'libs/storage',
    'libs/native',
    'libs/audio-player' // 初始化音频控件
  ], function(
    utils,
    Agent,
    Storage,
    Native
  ) {

    'use strict';

    /**
     *  1. 使用了 appcache 的话，使用它的那个页面不管有没有在 manifest.appcache 中指定，都会 cache 的
     *  2. 只有 manifest.appcache 文件更新了，缓存才能重新更新
     *
     *  所以，当 index.html 文件使用了 manifest.appcache 时，它会被缓存，而当我更新了 index.html 的内容后，
     *  用户进来后看到的可能并不是最新的，因为 index.html 先会从缓存中取的，取完之后浏览器检查到 manifest.appcache
     *  文件有更新，所以就会去更新 cache，但这时 index.html 已经加载完了。只有用户下次再进来时看到的才会是最新的
     *
     *  通过下面这个程序可以解决上面的问题
     */
    function cache_update() {
      var cache = null;

      [
        'webkitApplicationCache',
        'mozApplicationCache',
        'msApplicationCache',
        'applicationCache'
      ].forEach(function(key) {
        if (key in window) {
          cache = window[key];
        }
      });

      if (!cache) return ;

      window.addEventListener('load', function() {
        cache.addEventListener('updateready', function() {
          if (cache.status === cache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            window.location.reload();
          } else {
            // Manifest didn't changed. Nothing new to server.
          }
        }, false);
      }, false);
    }


    /**
     *  当前页面是分享页面
     *  对它进行一些初始化
     */
    function share_init() {
      // 分享过来的页面

      // 分享在 微信 平台，要更换下载地址成腾讯的应用宝的下载地址
      if (Agent.platform.wechat) {
          utils.__('.download-btns .btn').forEach(function(btn) {
              btn.setAttribute('href', 'http://a.app.qq.com/o/simple.jsp?pkgname=com.liulishuo.engzo&g_f=991653');
          });

          document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
            var shareUrl = location.href.split('?').shift() + '?share=yes#game',
              title = '英语流利说：测测你的另一半';
            // 发送给好友
            WeixinJSBridge.on('menu:share:appmessage', function () {
              WeixinJSBridge.invoke('sendAppMessage', {
                //"appid": "123",
                "img_url": "http://api.llsapp.com/ops-activity/images/wechat-logo.png",
                //"img_width": "160",
                //"img_height": "160",
                "link": shareUrl,
                "desc":  Storage.get('worldcup-result'),
                "title": title
              }, function (res) {
                //_report('send_msg', res.err_msg);
              });
            });

            // 分享到朋友圈
            WeixinJSBridge.on('menu:share:timeline', function () {
              WeixinJSBridge.invoke('shareTimeline', {
                "img_url": "http://api.llsapp.com/ops-activity/images/wechat-logo.png",
                //"img_width": "160",
                //"img_height": "160",
                "link": shareUrl,
                "desc":  Storage.get('worldcup-result'),
                "title": title
              }, function (res) {
                //_report('timeline', res.err_msg);
              });
            });
          }, false);
      }

      if (Agent.isIOS) {
          utils._('.download-ios').classList.remove('hidden');
      } else if (Agent.isAndroid) {
          utils._('.download-android').classList.remove('hidden');
      }
      utils._('.share-ad').classList.remove('hidden');
    }


    return function(path, urlObj) {
      cache_update();


      // 保存 token
      var token = urlObj.params.token,    // 用户 token
          version = urlObj.params.version,    // 版本号, 要么无、要么是v6，v6版的app和之前的 token 不兼容
          app_id = urlObj.params.appId,
          device_id = urlObj.params.deviceId; // 设备 ID
      if (token) Storage.set('token', token);
      if (version) Storage.set('version', version);
      if (app_id) Storage.set('app_id', app_id);
      if (device_id) Storage.set('device_id', device_id);


      if (urlObj.params.share === 'yes') {
        share_init();
      }

      // 初始化页面的一些基本信息
      if (Agent.isIOS) {
          // 加上 “此活动与苹果无关声明”
          var elem = utils._('#ios-relative');
          if (elem) elem.classList.add('ios-declare');
      }

      if (Agent.isIOS || Agent.platform.wechat) {
          // 苹果系统或微信下不需要 header
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
    };
});
