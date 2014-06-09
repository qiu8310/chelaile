require.config({

});


function testPropertyAndType(Obj, property, type, label) {
  describe('@' + (label || property), function() {
    it('should contain the property', function() {
      assert.property(Obj, property);
    });
    it('should be ' + type, function() {
      assert.typeOf(Obj[property], type);
    });
  });
}


require([
  'testEvent',
  'testEnv',
  'testAgent',
  'testUtils'
  ], function() {
    'use strict';

    mocha.run();
});
