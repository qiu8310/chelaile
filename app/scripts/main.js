'use strict';

var Dialog = require('./libs/dialog'), Router = require('./libs/router'), init = require('./app/init');

function page_index() {}
function page_leaderboard() {}

Dialog.alert('Dialog');

// 路由
Router// 所有页面都执行，而且是首先执行
  .all(init)

  // 首页
  .on('index', page_index)

  // 排行榜
  .on('leaderboard', page_leaderboard)

  // 默认也是首页
  .other(page_index);



