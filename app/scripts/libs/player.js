define(function() {

  function Player(src, cfg) {
    var player, isplay = false, name = 'audio-player';
    player = document.createElement('Audio');
    player.className = name;
    player.style.display = 'none';

    if (cfg)
      for (var key in cfg)
        if (cfg.hasOwnProperty(key)) player[key] = cfg[key];

    document.body.appendChild(player);
    this.player = player;

    this.player.src = src;
  }

  Player.prototype = {
    volume: function(val) {
      return val ? (this.player.volume = val) : this.player.volume;
    },
    isPlaying: function() {
      return isplay;
    },
    play: function() {
      isplay = true;
      this.player.play();
    },
    pause: function() {
      isplay = false;
      this.player.pause();
    },
    time: function(val) {
      return val ? (this.player.currentTime = val) : this.player.currentTime;
    },
    totalTime: function() {
      return this.player.duration;
    },
    on: function(type, func) {
      var i,
        self = this,
        types = type.split(/\s+/),
        handler = function(e) {
          // chrome bug， 音频结束的时候同时会触发 paused 和 ended 事件
          if (self.player.ended && e.type === 'pause') return;
          func.apply(self, Array.prototype.slice.call(arguments));
        };

      for (i = 0; i < types.length; ++i)
        if (types[i]) this.player.addEventListener(types[i], handler, false);
    }
  };

  return Player;
});
