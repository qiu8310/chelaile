require.config({

});


function testPropertyAndType(Obj, property, type) {
  describe('@' + property, function() {
    it('should contain the property', function() {
      assert.property(Obj, property);
    });
    it('should be ' + type, function() {
      assert.typeOf(Obj[property], type);
    });
  });
}


require([
  'testEnv',
  'testAgent'
  ], function() {
    'use strict';

    mocha.run();
});
