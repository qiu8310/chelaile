
require(['libs/stat', 'libs/wechat'], function(Stat, Wechat) {
  'use strict';

  // var APPID = 'wx9462c1810893f942'; // fcbst 测试用的一个 APPID
  var APPID = 'wx9fce185521717341'; // 微信提供的一个测试 ID
  var
    //elemImg = document.getElementById('img'),
    elemLog = document.getElementById('log'),
    elemStatus = document.getElementById('status'),
    elemRecord = document.getElementById('record'),
    elemUpload = document.getElementById('upload'),
    elemControl = document.getElementById('control'),
    elemDownload = document.getElementById('download');

  function click(elem, cb) {
    elem.addEventListener('click', function(e) {
      e.preventDefault();
      cb();
    });
  }
  function _log(elem, msg) {
    if (typeof msg === 'object') msg = JSON.stringify(msg);
    elem.innerText = msg;
  }
  function log(msg) { _log(elemLog, msg); }
  function status(msg) { _log(elemStatus, msg); }

  var curAudioId, serverId;
  // 录音
  click(elemRecord, function() {
    Wechat.invoke('startRecord', {appId: APPID}, function(res) {
      log(res);
      Stat.remote('info', 'startRecord', res);
      curAudioId = res.localId;
    });
  });

  // 上传
  click(elemUpload, function() {
    if (!curAudioId) {
      Stat.remote('error', 'Please record voice first!');
      log('Please record voice first!');
      return false;
    }

    var params = { appId: APPID, localId: curAudioId };
    Wechat.invoke('uploadVoice', params, function(res) {
      if (res.serverId) {
        serverId = res.serverId;
      }
      var result = {res: res, params: params};
      log(result);
      Stat.remote('info', 'uploadVoiceResult', result);
    });
  });

  // 下载
  click(elemDownload, function() {
    // serverId = 'B4mSUv8qciaghQO_q1VYRFIuaIY00YAHo_03aWtFp9vvUJUwFQJrZDlHZXFh3sdR';
    if (!serverId) {
      Stat.remote('error', 'Please upload voice first!');
      log('Please upload voice first!');
      return false;
    }

    var params = { appId: APPID, serverId: serverId };
    Wechat.invoke('downloadVoice', params, function(res) {
      if (res.localId) {
        curAudioId = res.localId;
      }
      var result = {res: res, params: params};
      log(result);
      Stat.remote('info', 'downloadVoiceResult', result);

    });
  });


  var s = 0;
  status(s);
  click(elemControl, function() {
    var params = {appId: APPID, localId: curAudioId};
    Wechat.invoke('playVoice', params, function(res) {
      log(res);
    });
  });

  Wechat.on(function(arg) {
    status({arg: arg, ctx: this});
  });


});
