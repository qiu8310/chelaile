
require(['libs/stat', 'libs/wechat'], function(Stat, Wechat) {
  'use strict';

  // var APPID = 'wx9462c1810893f942'; // fcbst 测试用的一个 APPID
  var APPID = 'wx9fce185521717341'; // 微信提供的一个测试 ID

  var _ = function (id) { return document.getElementById(id); };
  var
    elemImg = _('img'),
    elemPick = _('pick'),
    elemLog = _('log'),
    elemStatus = _('status'),
    elemRecord = _('record'),
    elemUpload = _('upload'),
    elemControl = _('control'),
    elemDownload = _('download');

  function click(elem, cb) {
    elem.addEventListener('click', function(e) {
      e.preventDefault();
      cb();
    });
  }
  function _log(elem, msg, append) {
    if (typeof msg === 'object') msg = JSON.stringify(msg);
    if (append) elem.innerText = elem.innerText + '\r\n' + msg;
    else elem.innerText = msg;
  }
  function log(msg, append) { _log(elemLog, msg, append); }
  function status(msg, append) { _log(elemStatus, msg, append); }
  function extra(msg, append) {_log(_('extra'), msg, append); }

  var serverId, voice;
  click(_('clear'), function() {
    elemStatus.innerText = '';
    elemLog.innerText = '';
    _('wechat').innerText = '';
    _('extra').innerText = '';
  });

  _('file').addEventListener('change', function() {
    log(arguments);
  }, false);

  click(elemPick, function() {
    Wechat.pickImages({
      success: function(data) {
        elemImg.src = data.localIds[0];
        extra(data);
      },
      error: function() {
        log(arguments);
      }
    });
  });


  // 录音
  click(elemRecord, function() {
    Wechat.recordVoice({appId: APPID}, {
      success: function(data) {
        voice = new Wechat.Voice(APPID, data.localId);
      }
    });
  });

  // 上传
  click(elemUpload, function() {
    if (!voice) {
      log('Please record voice first!');
      return false;
    }

    var params = { appId: APPID, localId: voice.id };
    Wechat.uploadVoice(params, {
      success: function(data) {
        serverId = data.serverId;
      }
    });
  });

  // 下载
  click(elemDownload, function() {
    // serverId = 'B4mSUv8qciaghQO_q1VYRFIuaIY00YAHo_03aWtFp9vvUJUwFQJrZDlHZXFh3sdR';
    if (!serverId) {
      log('Please upload voice first!');
      return false;
    }

    var params = { appId: APPID, serverId: serverId };
    Wechat.downloadVoice(params, {
      success: function(data) {
        voice = new Wechat.Voice(APPID, data.localId);
      }
    });
  });


  click(elemControl, function() {
    voice.play();
  });

  Wechat.on(function(arg) {
    status({arg: arg, ctx: this}, true);
  });




});
