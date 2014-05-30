define([], function() {

  'use strict';


  var AudioPlayer = (function() {
    var _stop_callback,
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
        play(target);
      }
    }, false);

    return {
      play: play,
      stop: stop,
      onEnd: function(func) {
        _stop_callback = func;
        return this;
      }
    };
  })();


});
