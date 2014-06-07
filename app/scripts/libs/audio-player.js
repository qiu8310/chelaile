define([], function() {

  'use strict';
  /*
    UI 结构
      <div class="audio-control [status]" data-status="" data-process=""></div>

      status 有： inited、stopped、paused、playing、loading
      process：默认可以不设置(或设置成 default)，直接用 audio 去播放 data-src 指定的值
  */

  // var TAG = 'audio-control';
  // var STATUSES = ['inited', 'stopped', 'paused', 'playing', 'loading'];

  // function audioStatus(elem, status) {
  //   var data = elem.dataset;
  //   if (typeof status === 'undefined') return data.status;

  //   elem.className = TAG + ' ' + status;
  //   elem.classList.remove.apply(elem.classList, STATUSES);
  //   elem.classList.add(status);
  //   data.status = status;
  // }

  /*
    options:
      preload: none/auto/metadata
      loop: false
      autoplay: false
  */



  var AudioPlayer = (function() {
    var _stop_callback, _play_callback,
      player,
      _player_id = '__player_id__',
      _last_control;

    function getPlayer() {
      if (!player) {
        player = document.getElementById(_player_id);

        if (!player) {
          player = document.createElement('audio');
          player.id = _player_id;
          document.body.appendChild(player);
          player.addEventListener('ended', stop, false);
          // player.addEventListener('canplay', function() {
          // }, false);
        }
      }
      return player;
    }

    function stop() {
      if (player) {
        player.pause();
      }
      if (_last_control) {
        _last_control.classList.remove('stop');
        _last_control = null;
      }
      if (_stop_callback) {
        _stop_callback.call(null);
      }
    }

    function play(control) {
      getPlayer();
      if (_last_control === control) {
        player.play();
      } else {
        var src = control.getAttribute('data-src');
        if (src) {
          control.classList.add('stop');
          stop();
          player.src = src;
          player.play();
          if (_last_control) {
            _last_control.classList.remove('stop');
          }
        }
      }
      _last_control = control;
    }

    document.addEventListener('click', function(e) {
      var target = e.target, classList = target.classList;
      if (!classList.contains('audio-control') || classList.contains('disabled')) return ;

      if (classList.contains('stop')) {
        stop();
        classList.remove('stop');
      } else {
        if (_play_callback) _play_callback.call(null);
        play(target);
      }
    }, false);

    return {
      play: play,
      stop: stop,
      onPlay: function(func) {
        _play_callback = func;
        return this;
      },
      onEnd: function(func) {
        _stop_callback = func;
        return this;
      }
    };
  })();


  return AudioPlayer;


});
