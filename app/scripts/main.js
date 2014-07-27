'use strict';

var DEFAULT_SHARE_KEY = 'shen_jing_mao';

var Debug = require('./libs/debug');
window.onerror = function(msg, src, line) {
  Debug.error(msg, src, line);
}
Debug.log('debug start');


require('fastclick')(document.body);
var utils = require('./libs/utils'),
    wechat = require('./libs/wechat-simple'),
    ajax = require('./libs/ajax'),
    Collapse = require('./app/collapse'),
    DATA = require('./app/data');


window.utils = utils;
window.ajax = ajax;




function set_img(img_url) {
  utils._('[name=img_url]').value = img_url;
  utils._('.thumbnail img').setAttribute('src', utils.appendQuery(img_url, '_=' + Date.now()));
}
function fill_form(share_key) {
  var data = DATA.popular_share[share_key] || DATA.popular_share[DEFAULT_SHARE_KEY],
      share_data = data.share_data;

  utils.elemText(utils._('.navbar-brand'), data.label);
  utils.objectFillForm(share_data, document.wechat_professor);
  set_img(share_data.img_url);
}


// 分享
wechat.share(function(callback) {
  var data = utils.objectifyForm(document.wechat_professor),
      share_data = {
        title: data.title,
        desc: data.desc,
        img_url: data.img_url,
        link: data.link
      };

  ajax({
    url: DATA.data_uploader_url,
    type: 'POST',
    dataType: 'text',
    data: data,
    success: function(id) {
      if (id.length > 1) {
        share_data.link = DATA.share_url + id;
      }
      callback(share_data);
    },
    error: function() {
      callback(share_data);
    }
  });
}, function(status) {
  Debug[status ? 'success' : 'error']([].slice.call(arguments));
});



document.addEventListener('DOMContentLoaded', function() {
  // 开始分享按钮
  var elem_mask = utils._('#mask');
  var bg = 'rgba(0, 0, 0, .8) url("' + DATA.wechat_share_arrow + '") no-repeat 95% 2% / 100px 100px';
  elem_mask.style.cssText = 'background: ' + bg + ';';
  utils.on('#start_share', 'click', function() {
    elem_mask.style.display = 'block';
    utils.delay(3000, function() {
      elem_mask.style.display = 'none';
    });
  });


  // 监听文件上传事件
  utils.on('[type=file]', 'change', function(e) {
    var formData = new FormData();
    if (!this.files[0]) {
      return false;
    }

    formData.append('file', this.files[0]);

    ajax({
      url: DATA.file_uploader_url,
      type: 'POST',
      dataType: 'json',
      data: formData,
      success: function(data) {
        set_img(data.file.url + '?imageView2/5/w/80/h/80');
      }
    });
  });


  // Menu
  var collapse = new Collapse(utils._('#navbar-collapse'));

  utils.on('[data-toggle="collapse"]', 'click', function() {
    collapse.toggle();
  });
  utils.on(document, 'click', '#navbar-collapse a', function() {
    collapse.toggle();
    fill_form(this.href.split('#').pop());
  });

  // 初始化 Data
  fill_form(location.hash.substr(1))

});



