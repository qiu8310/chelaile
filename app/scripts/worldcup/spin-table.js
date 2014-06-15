require.config({
    baseUrl: '../scripts/'
});

require([
    'libs/stat',    // stat 放最前面，里面有个 onerror 的统计脚本
    'init',
    'worldcup/game'
], function (
    Stat,
    init,
    gameon
) {
    'use strict';

    // 抽奖游戏
    gameon(
        // 点击了 "开始游戏"
        function() {
            Stat.gaTrack('play_game', 'click', '开始游戏点击');
        },
        // 点击了 "分享"
        function(text) {
            Stat.gaTrack('share', 'click', '分享点击', function() {
                //var url = location.href.split('?').shift() + '?share=yes#game';
                //Native.share(url, text);
                console.log(text);
            });
        }
    );
});
