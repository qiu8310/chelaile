define(['libs/env'], function(Env) {
  'use strict';

  describe('libs/env', function() {
    testPropertyAndType(Env, 'isLocal', 'boolean');
    testPropertyAndType(Env, 'isStaging', 'boolean');
    testPropertyAndType(Env, 'isOnline', 'boolean');
  });

});
