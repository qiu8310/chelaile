define(['libs/stat', 'libs/ajax'], function(Stat, ajax) {
  'use strict';

  var Debug = Stat.local;

  // 将一些 HTML5 的新功能去掉前缀，直接写入到对应的全局对象中
  (function() {
    var features = {
      getUserMedia: { context: window.navigator },
      Worker:       {},
      AudioContext: {},
      URL:          {},
      BlobBuilder:  {}
    }, vendors = ['webkit', 'moz', 'ms'];

    var key, item, vendorKey;
    for (key in features) {
      item = features[key];
      item.context = item.context || window;  // 默认写入 window 对象中

      if (key in item.context) {
        Debug.info('support ' + key);
        continue;
      }
      vendors.some(function(vendor) {
        vendorKey = vendor + key.charAt(0).toUpperCase() + key.substr(1);
        if (vendorKey in item.context) {
          Debug.info('support ' + vendorKey);
          item.context[key] = item.context[vendorKey];
          return true;
        }
      });
    }
  })();



  var UserMedia = {
    supported: !!navigator.getUserMedia,
    get: navigator.getUserMedia
  };


  var fileUploadUrl = 'http://fcbst.sinaapp.com/util/cb.php';


  return UserMedia;

});
