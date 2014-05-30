define(function() {
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
