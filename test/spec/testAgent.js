define(['libs/agent'], function(Agent) {
  'use strict';

  describe('libs/agent', function() {
    testPropertyAndType(Agent, 'isIOS', 'boolean');
    testPropertyAndType(Agent, 'isAndroid', 'boolean');
    testPropertyAndType(Agent, 'isOthers', 'boolean');
  });

});
