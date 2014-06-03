define(['libs/agent'], function(Agent) {
  'use strict';

  describe('libs/agent', function() {
    testPropertyAndType(Agent, 'isIOS', 'boolean');
    testPropertyAndType(Agent, 'isAndroid', 'boolean');
    testPropertyAndType(Agent, 'isOthers', 'boolean');
    testPropertyAndType(Agent.platform, 'wechat', 'boolean', 'platform.wechat');
    testPropertyAndType(Agent.platform, 'lls', 'boolean', 'platform.lls');
  });

});
