define(['libs/env', 'libs/storage', 'libs/ajax'], function(Env, Storage, ajax) {
  'use strict';

  var base;
  if (Env.isLocal) {
    base = 'http://staging.llsapp.com/api/:version:/activities/5388424b0af9963bf3000001';
  } else if (Env.isStaging) {
    base = 'http://staging.llsapp.com/api/:version:/activities/5388424b0af9963bf3000001';
  } else {
    // TODO  添加 activity id
    base = 'http://api.llsapp.com/api/:version:/activities/538d74befcfff2990a000001';
  }

  return function(path, params) {
    params = params || {};
    var device_id = Storage.get('device_id'),
      app_id = Storage.get('app_id'),
      version = Storage.get('version') || 'events';

    params.url = base.replace(':version:', version) + path;
    params.type = params.type || 'get';
    params.dataType = params.dataType || 'json';

    params.data = params.data || {};
    // params.data.timestamp = Date.now(); // 我默认开启了 ajax 的 cache，所以这里不用了
    params.data.token = params.data.token || Storage.get('token');
    if (device_id) params.data.deviceId = device_id;
    if (app_id) params.data.appId = app_id;
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
