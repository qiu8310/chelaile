require.config({
    baseUrl: '../scripts/'
});


require(['libs/dialog', 'libs/lottery'], function(Dialog, Lottery) {
  'use strict';
  // 刮奖
  new Lottery(document.getElementById('lottery'), {
    success: function() {
      Dialog.alert('end forever');
      this.destroy();
    },
    error: function(status, msg) {
      Dialog.alert(msg);
    }
  });

  new Lottery(document.getElementById('lottery2'), {
    success: function() {
      Dialog.alert('end and restart');
      this.reset();
    },
    error: function(status, msg) {
      Dialog.alert(msg);
    }
  });
});
