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
    'libs/utils',
    'libs/router',
    'libs/dialog'
], function (
    Stat,
    init,
    utils,
    Router,
    Dialog
) {
    'use strict';

    function page_index() {}
    function page_leaderboard() {}

    Dialog.alert('Dialog');

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
