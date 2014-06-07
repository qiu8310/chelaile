define([], function() {
  'use strict';

  /*
    1.
      Event.on(type, handler);
      Event.trigger(type, args);

    2.
      var obj = {};
      Event.wrap(obj)
      obj.on(type, handler);

    3.
      var SomeClass = function() {};
      Event.wrap(SomeClass.prototype);
      var obj = new SomeClass();
      obj.on(type, handler);

    注意：
      对于 wrap 的对象，要删除时最好都 obj.off() 一下
  */

  var events = {};
  var wrapObjs = [];
  var CTXS = 'i__ctxs__i';
  function getEvents(type) {
    if (!type) return events;

    var segs = type.split('.');
    var obj = events;
    for (var i = 0; i < segs.length; ++i) {
      if (!(segs[i] in obj)) obj[segs[i]] = {};
      obj = obj[segs[i]];
    }
    return obj;
  }

  function addEvent(type, handler, target) {
    var obj = getEvents(type);

    if (!(CTXS in obj)) obj[CTXS] = [];
    obj[CTXS].push([handler, target]);
  }


  function delEvent(obj, handler, target) {
    for (var key in obj) {
      if (obj[CTXS]) {
        for (var j = obj[CTXS].length - 1; j >= 0; j--) {
          if (handler && obj[CTXS][j][0] && obj[CTXS][j][0] !== handler) continue;
          if (target && obj[CTXS][j][1] && obj[CTXS][j][1] !== target) continue;
          obj[CTXS].splice(j, 1);
          if (obj[CTXS].length === 0) {
            delete obj[CTXS];
          }
        }
      } else {
        delEvent(obj[key], handler, target);
      }
    }
  }

  function trigEvent(obj, args, ctx) {
    for (var key in obj) {
      if (key === CTXS) {
        if (obj[key].length > 0) {
          for (var it, l = obj[key].length, i = 0; i < l; ++i ) {
            it = obj[key][i];
            it[0].apply(ctx || it[1], args);
          }
        } else {
          delete obj[key];
        }
      } else {
        trigEvent(obj[key], args, ctx);
      }
    }
  }

  function _target(obj) {
    return wrapObjs.indexOf(obj) >= 0 ? obj : window;
  }

  var Event = {
    trigger: function(types, args, ctx) {
      var target = _target(this);

      types.split(/\s+/).forEach(function(type) {
        var obj = getEvents(type);
        args = args || [];
        args.unshift({
          type: type.split('.').shift(),
          originalType: type,
          target: target
        });
        // 遍历 obj 下的所有 CTXS
        trigEvent(obj, args, ctx);

      });
    },

    on: function(types, handler) {
      var target = _target(this);

      types.split(/\s+/).forEach(function(type) {
        addEvent.call(events, type, handler, target);
      });
    },

    off: function(types, handler) {
      var target = _target(this);

      if (arguments.length === 0) {
        delEvent.call(events, events, handler, target);
        return ;
      }

      if (arguments.length === 1) {
        if (typeof types === 'function') {
          handler = types;
          types = null;
        }
      }

      types.split(/\s+/).forEach(function(type) {
        var obj = getEvents(type);
        delEvent.call(events, obj, handler, target);
      });
    },

    wrap: function(obj) {
      if (!obj) obj = {};
      ['trigger', 'on', 'off'].forEach(function(k) {
        obj[k] = Event[k];
      });
      wrapObjs.push(obj);
      return obj;
    }
  };

  return Event;

});
