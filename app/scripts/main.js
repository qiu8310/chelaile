require.config({
    paths: {
        zepto: '../bower_components/zepto/zepto',
        hammer: '../bower_components/hammerjs/hammer'
    },
    shim: {
        zepto: {
            exports: 'Zepto'
        }
    }
});

require([
    'libs/stat',    // stat 放最前面，里面有个 onerror 的统计脚本
    'init',
    'worldcup/game',
    'libs/utils',
    'libs/router',
    'libs/dialog',
    'libs/native',
    'libs/partial',
    'worldcup/api',

], function (
    Stat,
    init,
    gameon,
    utils,
    Router,
    Dialog,
    Native,
    partial,
    api
) {
    'use strict';

    // 首页脚本
    function page_index() {
        // 抽奖游戏
        gameon(
            // 点击了 "开始游戏"
            function() {
                Stat.gaTrack('play_game', 'click', '开始游戏点击');
                api('/lottery', {type: 'POST'});
            },
            // 点击了 "分享"
            function(text) {
                Stat.gaTrack('share', 'click', '分享点击', function() {
                    var url = location.href.split('?').shift() + '?share=yes#game';
                    Native.share(url, text);
                });
            }
        );

        // 状态
        var statuses = [], defaultStatus = 'content_module';
        var statusMap = {
            crowdfunding: 'group',
            content_module: 'normal',
            seckill: 'second'
        }, Act, Event, User;
        for (var k in statusMap) statuses.push(k);


        var MSG = {
            group: {
                confirm: '预购课程会从您账户中扣除60颗流利钻，确认报名？',
                coin: 60
            },
            normal: {
                confirm: '秒杀课程会从您账户中扣除90颗流利钻，确认报名？',
                coin: 90
            },
            second: {
                confirm: '购买课程会从您账户中扣除240颗流利钻，确认报名？',
                coin: 240
            }
        };

        function _progress() {
            // 进度条
            var progress,
                user_count = parseInt(Event.users_count, 10) || 0,
                total = 200;
            progress = (total - user_count) * 100 / total;
            utils._('.progress .mask').style.width = progress + '%';

            // 几人报名
            var dom_title = utils._('.progress .title'),
                tpl = dom_title.innerText || dom_title.textContent;
            dom_title.innerText = tpl.replace(/\d+/, user_count);

            // 已完成比例
            var dom_finish = utils._('.progress .finish-rate');
            tpl = dom_finish.innerText || dom_title.textContent;
            progress = Math.round(user_count * 1000 / total) / 10;
            dom_finish.innerText = tpl.replace(/\d+\%/, progress + '%');
        }

        // 请求首页数据
        api('/', {
            success: function(data) {
                Act = data && data.activity;
                User = data && data.user;
                Event = Act.events && Act.events[0] || {};
                var status = Event && utils.indexOf(statuses, Event.type) > -1 ? Event.type : defaultStatus;
                status = statusMap[status];
                Event._status = status;
                if (status === 'group') {
                    _progress();
                }
                partial(status);
            },
            error: function() {
                Dialog.alert('网络繁忙，请稍后再试');
            }
        });


        function handler(e) {
            if (!Act) {
                Dialog.alert('网络繁忙，请稍后再试');
            } else if (!User) {
                Dialog.alert('您尚末登录');
            } else if (Act.have_content_module) {
                Dialog.alert('您已成功购买', {btns: {cancel: '取消'}});
            } else if (MSG[Event._status].coin > User.coin) {
                Dialog.alert('您的钻石余额不足，请先去充值');
            } else {
                //var id = e.target.id.split('-').pop();
                var money = MSG[Event._status].coin / 10;
                var msg = MSG[Event._status].confirm;

                Stat.gaTrack('buy_course', 'click', money + '元购买课程');

                Dialog.confirm(msg, function(sure) {
                    if (!sure) return ;
                    api('/' + Event.type, {
                        type: 'POST',
                        success: function() {
                            Stat.gaTrack('buy_course', 'result', money + '元购买课程成功');
                            Act.have_content_module = true;
                            User.coin = User.coin - MSG[Event._status].coin;

                            if (Event._status === 'group') {
                                Event.users_count++;
                                _progress();
                                Dialog.alert('预购课程成功！');
                            } else {
                                Native.addModule(Act.content_module_id);
                            }
                        },
                        error: function() {
                            Stat.gaTrack('buy_course', 'result', money + '元购买课程失败');
                            Dialog.alert('网络繁忙，请稍后再试');
                        }
                    });
                });
            }
            e.preventDefault();
        }

        utils._('#btn-group').addEventListener('click', handler, false);
        utils._('#btn-second').addEventListener('click', handler, false);
        utils._('#btn-normal').addEventListener('click', handler, false);


        window.partial = partial;
        window.Dialog = Dialog;
    }

    function page_leaderboard() {
        api('/rank_list', {
            success: function(data) {
                console.log(data);
            },
            error: function() {}
        });
    }



    // 路由
    Router
        // 所有页面都执行，而且是首先执行
        .all(init)

        // 首页
        .on('index', page_index)

        // 排行榜
        .on('leaderboard', page_leaderboard)

        // 默认也是首页
        .other(page_index);

});
