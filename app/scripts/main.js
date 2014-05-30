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
    'worldcup/game',
    'libs/utils',
    'libs/router',
    'libs/dialog',
    'libs/native',
    'libs/agent',
    'libs/partial',
    'libs/storage',
    'worldcup/api',
    'libs/stat',
    'libs/audio-player'
], function (
    gameon,
    utils,
    Router,
    Dialog,
    Native,
    Agent,
    partial,
    Storage,
    api,
    Stat,
    AudioPlayer
) {
    'use strict';

    // 初始化页面的一些基本信息
    if (Agent.isIOS) {
        // 加上 “此活动与苹果无关声明”
        var gameElem = utils._('#game');
        if (gameElem) gameElem.classList.add('ios-declare');

        // 苹果系统不需要 header
        var headerElem = utils._('body > header');
        if (headerElem) headerElem.style.display = 'none';
    } else {
        // 其它系统首页的 back 需要使用 Native 的 back，即系统调用
        var backElem = utils._('.header-left a');
        if (backElem) {
            backElem.addEventListener('click', function(e) {
                if (backElem.classList.contains('back-to-app')) {
                    Native.back();
                } else {
                    window.history.back();
                }
                e.preventDefault();
            }, false);
        }
    }


    // 首页脚本
    function page_index(path, urlObj) {
        // 抽奖游戏
        gameon(
            // 点击了 "开始游戏"
            function() {
                Stat.track('test', 'start', 'start game');
            },
            // 点击了 "分享"
            function(text) {
                var url = location.href.split('#').shift() + '#game';
                Native.share(url, text);
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
        }

        // 请求首页数据
        api('/', {
            success: function(data) {
                Act = data && data.activity;
                User = data && data.user || {};
                Event = Act.events && Act.events[0] || {};
                var status = Event && utils.indexOf(statuses, Event.type) > -1 ? Event.type : defaultStatus;
                status = statusMap[status];
                Event._status = status;
                if (status === 'group') {
                    // 进度条
                    var progress,
                        user_count = parseInt(Event.users_count, 10) || 0,
                        total = 200;
                    progress = (total - user_count) * 100 / total;
                    utils._('.progress .mask').style.width = progress + '%';

                    // 几人报名
                    var dom_title = utils._('.progress .title'),
                        tpl = dom_title.innerText;
                    dom_title.innerText = tpl.replace(/\d+/, user_count);

                    // 已完成比例
                    var dom_finish = utils._('.progress .finish-rate');
                    tpl = dom_finish.innerText;
                    progress = Math.round(user_count * 1000 / total) / 10
                    dom_finish.innerText = tpl.replace(/\d+\%/, progress + '%');
                }
                partial(status);
            },
            error: function(status) {
                Dialog.alert('系统错误，请重试');
            }
        });

        utils._('#btn-group').addEventListener('click', handler, false);
        utils._('#btn-second').addEventListener('click', handler, false);
        utils._('#btn-normal').addEventListener('click', handler, false);

        function handler(e) {
            if (!Act || !User) {
                Dialog.alert('系统错误，请稍后再来');
            } else if (Act.have_content_module) {
                Dialog.alert('您已成功购买', {btns: {cancel: '取消'}});
            } else if (MSG[Event._status]['coin'] > User.coin) {
                Dialog.alert('您的钻石余额不足，请先去充值');
            } else {
                var id = e.target.id.split('-').pop();
                Dialog.confirm(MSG[Event._status]['confirm'], function(sure) {
                    if (!sure) return ;
                    api('/' + Event.type, {
                        type: 'POST',
                        success: function() {
                            Act.have_content_module = true;
                            User.coin = User.coin - MSG[Event._status]['coin'];
                            if (Event._status === 'group') {
                                Dialog.alert('秒杀成功！');
                            } else {
                                Native.addModule(Act.content_module_id);
                            }
                        },
                        error: function() {
                            Dialog.alert('系统错误，请稍后再来');
                        }
                    });
                });
            }
            e.preventDefault();
        }

        window.partial = partial;
        window.Dialog = Dialog;
    }

    function page_leaderboard(path, urlObj) {
        api('/rank_list', {
            success: function(data) {
                console.log(data);
            },
            error: function() {}
        });
    }



    // 路由
    Router
        // 所有页面都执行
        .all(function(path, urlObj) {
            // 保存 token
            var token = urlObj.params.token,
                act_id = urlObj.params.activity_id;

            token && Storage.set('token', token);
            act_id && Storage.set('activity_id', act_id);
        })

        // 首页
        .on('index', page_index)

        // 排行榜
        .on('leaderboard', page_leaderboard)

        // 默认也是首页
        .other(page_index);

});
