var MT = MT || {};
MT.TimeTracker = {
  rt: 1401860440079,
  st: Date.now()
};
window.addEventListener('load',
function() {
  MT.TimeTracker.lt = Date.now()
});
document.addEventListener('DOMContentLoaded',
function(e) {
  MT.TimeTracker.dt = Date.now();
  var _el = document.getElementById('meituan_check'),
  log = function(c, h) {
    var img = window['_' + Date.now()] = new Image(),
    d = {
      ip: document.body.getAttribute('data-ip'),
      ua: window.navigator.userAgent,
      evs: [{
        nm: 'ERROR',
        cate: c,
        url: encodeURIComponent(location.href)
      }]
    };
    if (h) d.evs[0].height = h;
    img.src = 'http://api.mobile.meituan.com/data/collect.json?type=i_stat&content=' + JSON.stringify(d)
  };
  if (!_el) {
    log('incomplete', document.body.offsetHeight)
  } else if (_el.offsetTop < 100) {
    log('pageheight', document.body.offsetHeight)
  } else if (_el.offsetHeight > 1) {
    log('cdn', _el.offsetHeight)
  }
});
MT.log = {
  _logs: [],
  send: function(t, v) {
    this._logs.push({
      type: t,
      value: v
    })
  }
}
