define(['libs/utils'], function(utils) {

  'use strict';
  // 要确保加了 GA 统计

  var ga = window._gaq;


  /*
    index 自定义变量的类别，可以设置的范围是1-5
    name  自定义变量的名称，名称与值相对应。这里设置的内容将出现在自定义变量报告的最高一级。
    value 自定义变量的值，这个值与名称应该成对出现。
          通常一个名称可以对应很多个值。例如:当名称为性别时，对应的值就应该是男，女，两个值。
    scope 自定义变量的范围，可以设置的范围是1-3。
          其中1表示访客级别，2表示会话级别，3表示页面级别。为空时默认表示页面级别。

    Read more:
      https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingCustomVariables?hl=zh-cn
      http://bluewhale.cc/2010-10-07/google-analytics-custom-variables.html#ixzz33AVXiQCU

  */
  return function(index, key, value, scope) {

    ga.push(['_setCustomVar', index, key, value, scope]);

  }
});
