define(function() {
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

  // TODO 放在另一个文件中
  // agent.isInWeChatWebview ;

  return agent;

});
