define(['libs/utils'], function(utils) {

  function touchstart (e) {
    touchend();
    if (e.target.classList.contains('touchable')) {
      e.target.classList.add('touched');
    }
  }


  function touchend () {
    utils.__('.touched').forEach(function(ele) {
      ele.classList.remove('touched');
    });
  }

  document.addEventListener('touchstart', touchstart, false);
  document.addEventListener('touchend', touchend, false);
  document.addEventListener('touchcancel', touchend, false);

});