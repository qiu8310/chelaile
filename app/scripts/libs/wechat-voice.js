define(['libs/event', 'libs/wechat'],
  function(Event, Wechat) {
    'use strict';
    var STATUS = {
      STOPPED: 1,
      PLAYING: 2
    };

    var obj = {};
    Event.wrap(obj);

    function h(a, b){console.log(b)}
    Event.on('a.b.c', h);
    obj.on('a.b.c', h);
    obj.on('a.b', h);
    obj.on('a', h);
    //Event.off();
    obj.trigger('a.b', ['a.b']);


    /*
      attribute:
        appId
        localId
        serverId
        status

      opts = {
        uploaded: func  => 成功上传文件到微信服务器的回调
      }
    */
    var Map = {};

    function WechatVoice(appId, localId, opts) {
      opts = opts || {};

      this.status = STATUS.STOPPED;
      if (!localId || !appId) throw new Error('Absence arguments for new Voice()');
      this.id = localId.replace(/[^\w]/g, '');
      this.localId = localId;
      this.appId = appId;

      // 备份，方便查找
      Map[localId] = this;
    }

    // 静态录音的方法
    WechatVoice.record = function(params, opts) {
      var _oldSuccess = opts.success;
      opts.success = function(data) {
        var voice = new WechatVoice(params.appId, data.localId);
        _oldSuccess.call(null, voice);
      };
      Wechat.recordVoice(params, opts);
    };



    WechatVoice.prototype = {
      upload: function(success, error) {
        var self = this;
        if (self.serverId) {
          if (success) success(self.serverId);
          return ;
        }
        Wechat.uploadVoice({appId: self.appId, localId: self.localId}, {
          success: function(data) {
            self.serverId = data.serverId;
            if (success) success.call(self, data.serverId);
          },
          error: function(res) {
            if (error) error.call(self, res);
            self.trigger('error', [{type: 'uploadError', msg: res.err_msg}]);
          }
        });
      },
      play: function() {
        if (this.status === STATUS.PLAYING) return ;

        var self = this;
        Wechat.playVoice({appId: this.appId, localId: this.localId}, {
          complete: function() { self.status = STATUS.PLAYING; },
          error: function(res) { self.trigger('error', [{type: 'playError', msg: res.err_msg}], self); }
        });
      },
      stop: function() {
        if (this.status === STATUS.STOPPED) return ;

        var self = this;
        Wechat.stopVoice({appId: this.appId, localId: this.localId}, {
          complete: function() { self.status = STATUS.STOPPED; },
          error: function(res) { self.trigger('error', [{type: 'stopError', msg: res.err_msg}], self); }
        });
      },
      destroy: function() {
        this.off();
        Map[this.localId] = null;
        delete Map[this.localId];
      },
      isPlaying: function() { return this.status === STATUS.PLAYING; },
      isStopped: function() { return this.status === STATUS.STOPPED; }
    };

    Event.wrap(WechatVoice.prototype);

    if (Wechat.supported) {
      Wechat.on('voicebegin voiceend', function(e, data) {
        if (data.localId && (data.localId in Map)) {
          var type = e.type === 'voicebegin' ? 'play' : 'end';
          var voice = Map[data.localId];
          voice.trigger(type, [], voice);
          voice.status = type === 'play' ? STATUS.PLAYING : STATUS.STOPPED;
        }
      });
    }

    return WechatVoice;
  }
);
