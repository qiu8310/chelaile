define([], function() {
  'use strict';

  navigator.getUserMedia =  navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia;

  window.AudioContext = window.AudioContext ||
                        window.webkitAudioContext ||
                        window.mozAudioContext ||
                        window.msAudioContext;

  var UserMedia = {
    supported: !!navigator.getUserMedia,
    get: navigator.getUserMedia
  };


  return UserMedia;

});
