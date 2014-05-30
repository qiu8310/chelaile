define(['libs/env', 'libs/storage', 'libs/ajax'], function(Env, Storage, ajax) {
  'use strict';

  var base;
  if (Env.isLocal) {
    base = 'http://192.168.1.198:3000/api/events/activities/5388424b0af9963bf3000001';
  } else if (Env.isStaging) {
    base = 'http://staging.llsapp.com/api/events/activities/5388424b0af9963bf3000001';
  } else {
    // TODO  添加 activity id
    base = 'http://api.llsapp.com/api/events/activities/';
  }

  return function(path, params) {
    params = params || {};

    params.url = base + path;
    params.type = params.type || 'get';
    params.dataType = params.dataType || 'json';

    params.data = params.data || {};
    // params.data.timestamp = Date.now(); // 我默认开启了 ajax 的 cache，所以这里不用了
    params.data.token = params.data.token || Storage.get('token');
    alert(params.data.token);
    ajax(params);

    // $.ajax({
    //   url: path,
    //   type: type,
    //   data: params,
    //   dataType: 'json',
    //   success: callback,
    //   error: errCallback
    // });

  };

});
