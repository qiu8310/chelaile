var utils = require('../libs/utils');

var Collapse = function (target) {
  this.target = target;
  this.classList = this.target.classList;
}
Collapse.prototype.show = function() {
  if (this.transitioning || this.classList.contains('in')) {
    return false;
  }

  this.transitioning = 1;
  this.classList.remove('collapse');
  this.classList.add('collapsing');
  utils.css(this.target, 'height', '0');

  var complete = function () {
    this.classList.remove('collapsing');
    this.classList.add('collapse', 'in');
    utils.css(this.target, 'height', 'auto');
    this.transitioning = 0
  };

  utils.delay(0, utils.bindFuncToObject(complete, this));
};
Collapse.prototype.hide = function() {
  if (this.transitioning || !this.classList.contains('in')) {
    return false;
  }

  this.transitioning = 1;
  this.classList.add('collapsing');
  this.classList.remove('collapse', 'in');

  var complete = function () {
    this.classList.remove('collapsing');
    this.classList.add('collapse');
    this.transitioning = 0
  };

  utils.delay(0, utils.bindFuncToObject(complete, this));
};
Collapse.prototype.toggle = function() {
  this[this.classList.contains('in') ? 'hide' : 'show']();
};

module.exports = Collapse;