define(['libs/env', 'libs/storage', 'libs/ajax'], function(Env, Storage, ajax) {
  'use strict'

  var base;
  if (Env.isStaging || Env.isLocal) {
    // base = 'http://staging.llsapp.com/api/events/activities/5386e7fe283e552fc4000001';
    base = 'http://192.168.1.198:3000/api/events/activities/53873438283e55eb4c000001';
  } else {
    base = 'http://api.llsapp.com/api/events/activities/53873438283e55eb4c000001';
  }

  return function(path, params) {
    params.url = base + path;
    params.type = params.type || 'get';
    params.dataType = params.dataType || 'json';

    params.data = params.data || {};
    params.data.timestamp = Date.now();
    params.data.token = params.data.token || Storage.get('token');

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
