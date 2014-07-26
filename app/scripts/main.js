'use strict';

var Debug = require('./libs/debug');

require('fastclick')(document.body);

var utils = require('./libs/utils'),
    wechat = require('./libs/wechat'),
    ajax = require('./libs/ajax');

window.utils = utils;
window.ajax = ajax;

function uploadFiles(url, files) {
  var formData = new FormData();

  for (var i = 0, file; file = files[i]; ++i) {
    formData.append('file_' + i, file);
  }

  ajax({
    url: url,
    type: 'POST',
    dataType: 'json',
    data: formData,
    success: function(data) {
      var url = utils.appendQuery(data._FILES.file_0.url, '_=' + Date.now());
      utils._('#image_preview').setAttribute('src', url);

      var data = utils.objectifyForm(document.wechat_professor);
      wechat.shareToFrient(function() {
        return {
          title: data.title,
          desc: data.desc,
          img_url: url,
          link: data.link
        }
      });
    }
  });
}

Debug.log('debug log');
Debug.log('debug log');

document.querySelector('input[type="file"]').addEventListener('change', function(e) {
  uploadFiles('http://fcbst.sinaapp.com/util/cb.php', this.files);
}, false);
