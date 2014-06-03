define(
  ['libs/utils', 'libs/lucky-plate', 'worldcup/data', 'libs/dialog', 'libs/agent', 'libs/storage'],
  function(utils, LuckyPlate, Data, Dialog, Agent, Storage) {
  'use strict';

  // 抽奖游戏
  return function(start_callback, share_callback) {
    var CARD_LENGTH = 12;

    var container = utils._('.game'),
      controller = utils._('.lucky-plate .start'),
      nameInput = utils._('#name');

    var stars = Data.stars, keys = [];


    var tpl_result = '<div class="result"><img src="#{avatar}"><p>#{result}</p></div><div class="intro"><h1><span class="star-nick">#{nick}</span>&nbsp;<span class="star-name">#{name}</span></h1><p>#{desc}</p><a href="" class="btn btn-beg-bless">求祝福</a></div>';

    var tpl_share = '<div class="result"><img src="#{avatar}"><p>#{result}</p><p class="from">from 英语流利说</p></div><div class="btns"><a href="" class="btn btn-orange btn-sure">分享</a><a href="" class="btn btn-cancel">取消</a><div>';

    // init
    function initGame() {
      container.style.visibility = 'hidden';
      var key, html = [];
      for (key in stars) {
        keys.push(key);
      }
      keys = utils.shuffle(keys).slice(0, CARD_LENGTH);

      utils.each(keys, function(key) {
        html.push('<li><span>' + stars[key].name + '</span></li>');
      });
      utils._('.cards ul', container).innerHTML = html.join('');
      container.style.visibility = 'visible';
    }
    initGame();


    // 抽奖结束
    function end(i) {

        var key = keys[i],
          star = stars[key];
        star.avatar = 'images/stars/' + key + '.png';

        // 表单信息
        var gender = utils._('#woman').checked ? 'woman' : 'man',
          username = utils.trim(nameInput.value);

        // 结果信息
        star.result = utils.render(Data.game_result[gender], {username: username, starname: star.name});
        Storage.set('worldcup-result', star.result);
        Storage.set('worldcup-logo', 'http://api.llsapp.com/ops-activity/' + star.avatar);

        utils.delay(300, function() {

          controller.classList.remove('disabled');

          // dialog
          var dialog = Dialog.tpl(utils.render(tpl_result, star), 'dialog-game-end');

          // 按钮点击
          utils._('.btn-beg-bless', dialog.getContainer()).addEventListener('click', function(e) {
            dialog.close();

            if (!Agent.platform.lls) {
              Dialog.alert('想要更多惊喜吗？登录英语流利说吧');
              e.preventDefault();
              return false;
            }
            //initGame();

            // 分享窗口
            dialog = Dialog.tpl(utils.render(tpl_share, star), 'dialog-share');

            // 分享 或 取消
            var container = dialog.getContainer();
            utils._('.btn-cancel', container).addEventListener('click', function(e){
              dialog.close();
              e.preventDefault();
            });
            utils._('.btn-sure', container).addEventListener('click', function(e){
              if (share_callback) share_callback(star.result);
              //dialog.close();
              e.preventDefault();
            });

            e.preventDefault();
          }, false);
        });
    }

    function canGame() {
      return (utils.trim(nameInput.value)).length >= 1;
    }

    if (controller) {

      controller.addEventListener('click', function() {
        if (!canGame()) {
          Dialog.alert('请输入您的大名', {timeout: 2000});
          return false;
        }

        controller.classList.add('disabled');

        var stop = Math.round(Math.random() * 13);
        LuckyPlate.run(utils._('.lucky-plate'), stop, {runEnd: end, runStart: start_callback});
      }, false);
    }
  };


});
