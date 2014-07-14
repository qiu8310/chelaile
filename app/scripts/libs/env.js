var parse = require('./url-parser');
/**
 *  当前的环境:
 *    isStaging   测试环境
 *    isLocal     本地环境
 *    isOnline    线上环境
 */
'use strict';

var env = {}, url = parse(location.href), host = url.host;


env.url = url;


// staging 环境
env.isStaging = host === 'staging.llsapp.com';

// localhost 经常会带有端口号！
env.isLocal = host.indexOf('localhost') === 0 || host.indexOf('192.168') === 0;

env.isOnline = !env.isLocal && !env.isStaging;

module.exports = env;
