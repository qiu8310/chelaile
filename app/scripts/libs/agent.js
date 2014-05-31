define(['libs/storage'], function(Storage) {
  /**
   *  当前用户的操作系统
   *    iOS、android、others
   */
  'use strict';

  var
    agent_str = navigator.userAgent,
    agent = {};
  agent.isIOS = /iP(ad|hone|od)/.test(agent_str);
  agent.isAndroid = /Android/i.test(agent_str);
  agent.isOthers = !agent.isIOS && !agent.isAndroid;


  // 其它平台
  agent.platform = {};

  // 微信
  agent.platform.wechat = /MicroMessenger/i.test(agent_str);

  // 流利说 APP
  // 暂时不够准确，但可以依赖于 token 来判断，但 token 只有首页才有，所以也要依赖于 Storage
  agent.platform.lls = !!Storage.get('token');

  return agent;

});
