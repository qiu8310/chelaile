require.config({
    paths: {
        zepto: '../bower_components/zepto/zepto',
        jquery: '../bower_components/jquery/jquery',
        hammer: '../bower_components/hammerjs/hammer'
    },
    shim: {
      jquery: { exports: 'jQuery' },
      zepto: { exports: 'Zepto' }
    }
});

require([
  'libs/stat',
  'libs/wechat-voice',
  'libs/utils',
  'libs/dialog',
  'libs/agent',
  'libs/ajax',
  'libs/audio-player',
  'libs/user-media'],
  function(
    Stat,
    Voice,
    Utils,
    Dialog,
    Agent,
    ajax,
    Audio) {
  'use strict';
  window.ajax = ajax;
  Audio.setVolume(1.0);
  var APPID = 'wxfc46fc8cda06764a';

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

  var elemRecord = Utils._('#record');


  var Control = (function() {
    var wraper = Utils._('.dialogue');

    var Map = {};
    var dialogueCount = 0;

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
                    '<img src="images/no-hash/avatar_' + type + '.png">' +
                    '<div class="wx-audio-control"></div>' +
                '</div><article class="loading"><i></i><i></i><i></i></article>';
        elem = document.createElement('div');
        dialogueCount += 0.5;

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

        dialogueCount -= 0.5;
      },
      updateLastDialogue: function() {
        var last = getLast(),
          id = last.id;
        if (!Map[id]) return ;

        var elem = Map[id].elem;
        var article = Utils._('article', elem);

        ajax({
          url: 'http://staging-wx.llsapp.com/score?wechat_id=1&media_id=' + Map[id].voice.serverId,
          type: 'POST',
          dataType: 'json',
          cache: false,
          success: function(data) {
            article.classList.remove('loading');
            var labelClass = data.score >= 80 ? 'good' : (data.score >= 60 ? 'pass' : 'bad');
            article.innerHTML = '<label class="' + labelClass + '">' + data.score + '</label>' +
                    '<p class="result">' + data.score_detail + '</p>';
            dialogueCount += 0.5;
            elemRecord.innerHTML = '点击再试一次';
            Debug.success('分析数据成功 Score: ' + data.score);
          },
          error: function() {
            Dialog.alert('分析数据失败');
            Debug.error(arguments[1]);
            Control.removeLastDialogue();
          }
        });


      },
      getDialogueCount: function() {
        return dialogueCount;
      }
    };

    return Control;
  })();


  // 1 秒后自动播放音频
  var autoPlayTimer = setTimeout(function() {
    //var elem = Utils._('.audio-control');
    //if(elem.click) elem.click();
  }, 1000);

  // 录音
  click(elemRecord, function() {
    // 停止上次播放的声音
    Control.stopLastVoice();
    clearTimeout(autoPlayTimer);

    if (/\.5$/.test(Control.getDialogueCount().toString())) {
      Dialog.alert('上一次录音结果还在分析中，请稍后');
      return ;
    }

    Voice.record({appId: APPID}, {
      success: function(voice) {
        Control.addDialogue('master', voice);
      },
      error: function(res) {
        Dialog.alert('录音失败: ' + res.err_msg);
      }
    });
  });

});
