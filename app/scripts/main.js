'use strict';

// 头像
// http://qzapp.qlogo.cn/qzapp/100383694/7D29C05E0425C97483ED8CD1D681C1A6/100
// http://llss.qiniudn.com/avatar_default.png

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



