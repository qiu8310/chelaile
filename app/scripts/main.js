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


require(['libs/lucky-plate', 'libs/utils', 'zepto'], function (LuckyPlate, utils, $) {
    'use strict';


    var isEnd = true;
    function end(i) {
        isEnd = true;
        console.log(i);
    }
    $('.lucky-plate .start').on('click', function() {
        if (!isEnd) return ;
        isEnd = false;
        LuckyPlate.run(utils._('.lucky-plate'), '', end);
    });
});
