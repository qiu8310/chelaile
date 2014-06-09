define(['libs/event'], function(Event) {
  'use strict';


  describe('libs/event', function() {

    describe('Event', function() {

      it('trigger("foo.bar") should trigger on("foo.bar", ..) and on("foo.bar.xxx", ..)', function() {
        var count = 0;
        function handler(e) {
          count++;
          assert.equal(e.triggerType, 'foo.foo');
        }
        Event.on('foo', handler)
        Event.on('foo.foo', handler)
        Event.on('foo.foo.foo', handler);
        Event.trigger('foo.foo').off();

        assert.equal(count, 2);
      });

      it('mutiple events: on("foo bar") ', function() {
        var count = 0;
        function handler(e) {
          count ++;
        }
        Event.on('foo bar', handler);
        Event.trigger('foo').trigger('bar').off();
        assert.equal(count, 2);
      });
      it('mutiple events: trigger(foo bar)', function() {
        var count = 0;
        function handler(e) {
          count ++;
        }
        Event.on('foo', handler).on('bar', handler);
        Event.trigger('foo bar').off();
        assert.equal(count, 2);

      });
      it('mutiple events: off(foo bar)', function() {
        var count = 0;
        function handler(e) {
          count ++;
        }
        Event.on('foo bar for', handler);
        Event.off('foo bar');
        Event.trigger('foo bar for').off();
        assert.equal(count, 1);
      });

      it('off() all events', function() {
        var count = 0;
        function handler(e) {
          count ++;
        }
        Event.on('foo bar for', handler);
        Event.off();
        Event.trigger('foo bar for').off();
        assert.equal(count, 0);

      });

      it('off(foo) should off foo, foo.xxx, foo.xxx.xxx', function() {
        var count = 0;
        function handler(e) {
          count++;
        }

        Event.on('foo', handler)
          .on('bar', handler)
          .on('foo.foo', handler)
          .on('bar.bar', handler);

        Event.off('bar.bar');

        Event.trigger('bar');
        assert.equal(count, 1);

        Event.trigger('bar.bar');
        assert.equal(count, 1);

        Event.off('foo');
        Event.trigger('foo.foo');
        assert.equal(count, 1);

        Event.off();
      });

      it('trigger(foo, [data1, data2]...) => handler(event, data1, data2)', function() {
        function t(){}
        var obj = {a: 'aaa'};
        function handler(e, a, b, c) {
          if (e.type === 'foo') {
            assert.strictEqual(a, 'foo');
            assert.strictEqual(b, 3);
            assert.strictEqual(c, t);
          } else {
            assert.strictEqual(a, 'bar');
            assert.strictEqual(b, true);
            assert.strictEqual(c, obj);
          }
        }

        Event.on('foo', handler);
        Event.on('bar', handler);
        Event.trigger('foo', ['foo', 3, t]);
        Event.trigger('bar', ['bar', true, obj]).off();
      });

      it('on(foo, somedata) => handler(event) => event.data === somedata', function() {
        function handler(e) {
          assert.equal(e.type, 'foo');
          assert.equal(e.data.bar, 'foo');
        }

        Event.on('foo', {bar: 'foo'}, handler);
        Event.trigger('foo').off();
      })

    });

    describe('Event on PlainObject', function() {
      var obj;
      var count;
      var handler;
      beforeEach(function() {
        obj = {foo: 'foo', bar: 'bar'};
        Event.wrap(obj);
        count = 0;
        handler = function() { count++; };
      })
      afterEach(function() {
        obj.off();
        obj = null;
        count = null;
        handler = null;
      })

      it('should can trigger', function() {
        obj.on('foo', handler);
        assert.equal(count, 0);
        obj.trigger('foo');
        assert.equal(count, 1);

        obj.on('bar.bar', handler);
        obj.trigger('bar');
        assert.equal(count, 2);
      })
    });

    describe('Event on FunctionClass', function() {
      var Star;
      var count;
      var handler;
      beforeEach(function() {
        Star = function(){ this.number = 0; };
        Event.wrap(Star.prototype);
        count = 0;
        handler = function() { count++; };
      })
      afterEach(function() {
        Star.prototype.off();
        Star = null;
        count = null;
        handler = null;
      })

      it('should can trigger', function() {
        var star = new Star();

        star.on('foo', handler);
        assert.equal(count, 0);

        star.trigger('foo');
        assert.equal(count, 1);

        var anotherStar = new Star();
        anotherStar.trigger('foo');
        assert.equal(count, 1);
        anotherStar.on('foo', handler);
        anotherStar.trigger('foo');
        assert.equal(count, 2);
      });
    });




  });

});
