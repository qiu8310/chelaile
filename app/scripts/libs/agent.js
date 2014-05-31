define(function() {
  /**
   *  当前用户的操作系统
   *    iOS、android、others
   */
  'use strict';

  var
    agent_str = navigator.userAgent,
    agent = {};
  alert(agent_str);
  agent.isIOS = /iP(ad|hone|od)/.test(agent_str);
  agent.isAndroid = /Android/i.test(agent_str);
  agent.isOthers = !agent.isIOS && !agent.isAndroid;


  // 其它平台
  agent.platform = {};

  // 微信
  agent.platform.wechat = /MicroMessenger/i.test(agent_str);

  return agent;

});
