define(function() {
  /**
   *  解析 URL 成一个个小部分
   */
  'use stricts';

  var param_key_reg = /([-_\w]+)\[([-_\w]*)\]/;

  // 解析  arr[]=aaaa&arr[]=bbbb&obj[xxx]=xxx&obj[yyy]=yyy 这种类型的参数
  function push(name, val, data) {
    if (typeof val !== 'undefined') {
      var matcher = name.match(param_key_reg);
      if (matcher) {
        name = matcher[1];
        if (matcher[2]) {
          data[name] = data[name] || {};
          data[name][matcher[2]] = val;
        } else {
          data[name] = data[name] || [];
          data[name].push(val);
        }
      } else {
        data[name] = val;
      }
    }
  }


  function parseURL(url) {
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
            var ret = {},
                seg = a.search.substr(1).split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                push(s[0], s[1], ret);
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1')
    };
  }

  return parseURL;

});
