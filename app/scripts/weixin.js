
require([
  'libs/stat',
  'libs/wechat-voice',
  'libs/utils',
  'libs/dialog',
  'libs/agent',
  'libs/audio-player'],
  function(
    Stat,
    Voice,
    Utils,
    Dialog,
    Agent,
    Audio) {
  'use strict';

  var APPID = 'wx9fce185521717341'; // 微信提供的一个测试 ID

  if (!Agent.platform.wechat) {
    Dialog.alert('请在微信中浏览');
    return ;
  }

  function click(elem, cb) {
    elem.addEventListener('click', function(e) {
      e.preventDefault();
      cb();
    });
  }
  var Debug = Stat.local;
  window.onerror = function() { Debug.error(arguments, true); };



  var canRecord = true; // 是否可以录音，上一次的结果没返回之前一直都不能录

  var Control = (function() {
    var wraper = Utils._('.dialogue');

    var Map = {};

    function getLast() {
      var last = wraper.lastChild;
      if (last.nodeType === 3) { wraper.removeChild(last); last = wraper.lastChild; }
      return last;
    }


    // 音频控制
    var controlClass = 'wx-audio-control';
    var lastControl;

    // 停止上次播放的音乐
    function stopLastControl(curControl) {
      if (!lastControl || curControl === lastControl) return ;
      if (lastControl.isPlaying) {
        // Voice
        if (lastControl.isPlaying()) lastControl.stop();
      } else {
        // Audio
        lastControl.stop();
      }
      lastControl = null;
    }

    Audio.onPlay(function() { stopLastControl(Audio); lastControl = Audio; });

    document.addEventListener('click', function(e) {
      var target = e.target;
      if (!target.classList.contains(controlClass)) return ;

      var voice,
        elem = target.parentNode.parentNode,
        id = elem.id;

      if (!id || !(id in Map)) return ;
      voice = Map[id].voice;

      if (voice.isPlaying()) {
        voice.stop();
      } else {
        stopLastControl(voice);
        voice.play();
        lastControl = voice;
      }

    }, false);

    // DOM 控制
    var Control = {
      stopLastVoice: stopLastControl,
      addDialogue: function(type, voice) {
        var elem, tpl = '<div class="avatar">' +
                    '<img src="images/avatar_' + type + '.png">' +
                    '<div class="wx-audio-control"></div>' +
                '</div><article class="loading"><i></i><i></i><i></i></article>';
        elem = document.createElement('div');

        var id = voice.id;
        elem.id = id;
        elem.className = type + ' member';

        elem.innerHTML = tpl;
        wraper.appendChild(elem);

        // 音频播放结束
        voice.on('end', function() {
          Utils._('.' + controlClass, Map[this.id].elem).classList.remove('stop');
        });
        voice.on('play', function() {
          Utils._('.' + controlClass, Map[this.id].elem).classList.add('stop');
        });

        voice.on('error', function(e, data) {
          Dialog.alert(data.type + data.msg);
          Debug.error(arguments);

          if (data.type === 'uploadError') {
            Control.removeLastDialogue();
          }
        });

        voice.upload(function(serverId) {
          Debug.success('上传音频成功 serverId: ' + serverId);

          // TODO 将 serverId 发给自己的后台，返回 {score: 77, text: [html] } 的 JSON
          // 如果发送后台失败还要 removeLastDialogue
          Control.updateLastDialogue();
        });

        // 保存数据
        Map[id] = {elem: elem, voice: voice};
      },
      removeLastDialogue: function() {
        var last = getLast();
        var id = last.id;
        if (Map[id]) {
          Map[id].voice.off();
          Map[id] = null;
          delete Map[id];
        }
        wraper.removeChild(last);
        last = null;

        canRecord = true;
      },
      updateLastDialogue: function() {
        var last = getLast(),
          id = last.id;
        if (!Map[id]) return ;

        var elem = Map[id].elem;
        var article = Utils._('article', elem);
        article.classList.remove('loading');
        article.innerHTML = 'TODO';

        canRecord = true;
      },
    };

    return Control;
  })();



  // 录音
  click(Utils._('#record'), function() {
    // 停止上次播放的声音
    Control.stopLastVoice();

    if (!canRecord) {
      Dialog.alert('上一次录音结果还在分析中，不能再录音');
      return ;
    }

    Voice.record({appId: APPID}, {
      success: function(voice) {
        canRecord = false;
        Control.addDialogue('master', voice);
      },
      error: function(res) {
        Dialog.alert('录音失败: ' + res.err_msg);
      }
    });
  });

});
