define(['libs/utils'], function(utils) {
  /**
   *  解析 URL 成一个个小部分
   */
  'use strict';

  function parseURL(url) {
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port ? parseInt(a.port, 10) : 80,
        query: a.search.replace('?', ''),
        params: utils.unserializeURL(a.search.substr(1)),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1') // pathname 最前面补上 / (如果没有的话)
    };
  }

  return parseURL;

});
