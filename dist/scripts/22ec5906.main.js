!function(){define("libs/env",[],function(){"use strict";var a={},b=location.host;return a.isStaging="staging.llsapp.com"===b,a.isLocal=0===b.indexOf("localhost")||0===b.indexOf("192.168"),a.isOnline=!a.isLocal&&!a.isStaging,a}),define("libs/stat",["libs/env"],function(a){"use strict";var b,c=_gaq,d={};return b={gaTrack:function(b,d,e,f){var g=arguments[arguments.length-1];"string"!=typeof e&&(e=void 0),"number"!=typeof f&&(f=void 0),c&&c.push&&a.isOnline&&c.push(["_trackEvent",b,d,e,f]),"function"==typeof g&&(c&&c.push?setTimeout(g,200):g())},log:function(b,c,d,e){var f="http://fcbst.sinaapp.com/log.php?from="+encodeURIComponent(c)+"&type="+encodeURIComponent(b);"undefined"!=typeof d&&(f+="&msg="+encodeURIComponent(d)),"undefined"!=typeof e&&(f+="&data="+encodeURIComponent(JSON.stringify(e))),a.isOnline?(new Image).src=f:console.error("logError: Category["+c+"] Msg["+d+"] Data["+e+"]")}},window.onerror=function(a,c,e){return d.onbeforeunload||b.log("error","appevent",a,{url:c,line:e,ua:navigator.userAgent}),!0},window.onbeforeunload=function(){d.onbeforeunload=!0},b}),define("libs/utils",[],function(){"use strict";var a={_:function(a,b){return(b||document).querySelector(a)},__:function(a,b){return[].slice.call((b||document).querySelectorAll(a))},each:function(a,b){for(var c=0;c<a.length;++c)b(a[c],c)},indexOf:function(a,b){if(a.indexOf)return a.indexOf(b);for(var c=0;c<a.length;c++)if(a[c]===b)return c;return-1},extend:function(a,b){if(arguments.length<2)return arguments[0];for(var c,d=1;d<arguments.length;++d){b=arguments[d];for(c in b)a[c]=b[c]}return a},appendQuery:function(a,b){if(""===b)return a;var c=a.split("#");return(c[0]+"&"+b).replace(/[&?]{1,2}/,"?")+(2===c.length?"#"+c[1]:"")},delay:function(a,b){setTimeout(b,a)},random:function(a,b){return"undefined"==typeof b&&(b=a,a=0),a+Math.floor(Math.random()*(b-a+1))},shuffle:function(b){for(var c,d,e=[],f=0;f<b.length;f++)d=b[f],c=a.random(f),e[f]=e[c],e[c]=d;return e},toString:function(a){return Object.prototype.toString.call(a)},trim:function(a){return a.replace(/^\s+|\s+$/g,"")},onInputChange:function(b,c){function d(){c&&c(a.trim(b.value))}b.addEventListener("change",d,!1),b.addEventListener("keyup",d,!1)},escapeHTML:function(a){var b=document.createElement("div"),c=document.createTextNode(a);return b.appendChild(c),b.innerHTML},render:function(b,c,d,e){return e="undefined"==typeof e?!0:!!e,d="undefined"==typeof d?!0:!!d,d||(b=b.replace(/#\{&([\w\-_]+)\s*\?\s*([^:]*?)\s*:\s*([^\}]*?)\s*\}/g,function(a,b,d,e){return c[b]?d:e}),b=b.replace(/#\{&repeat\s+([\w\-_]+)\s+([^\}]*?)\}/g,function(b,d,f){var g="";return d in c&&"[object Array]"===a.toString(c[d])&&a.each(c[d],function(b){g+=a.render(f,b,!0,e)}),g})),b=b.replace(/#\{([\w\-_]+)\}/g,function(b,d){return d in c?e?a.escapeHTML(c[d]):c[d]:""})},insertCSSCode:function(a){var b=document.createElement("style");b.type="text/css",b.media="screen",b.styleSheet?b.styleSheet.cssText=a:b.appendChild(document.createTextNode(a)),document.getElementsByTagName("head")[0].appendChild(b)},css:function(a,b,c){var d,e;return d="undefined"==typeof c?window.getComputedStyle(a,null):a.style,b in d||["Webkit","O","Moz","ms"].forEach(function(a){e=a+b.charAt(0).toUpperCase()+b.substr(1),e in d&&(b=e)}),"undefined"==typeof c?d[b]:d[b]=c},circle:function(a,b){return(b+a%b)%b}};return a}),define("libs/storage",[],function(){"use strict";var a=window.localStorage;return{set:function(b,c){a&&(a[b]=c)},get:function(b){return a&&a[b]},del:function(b){a&&a.removeItem(b)}}}),define("libs/Agent",["libs/storage"],function(a){"use strict";var b=navigator.userAgent,c={};return c.isIOS=/iP(ad|hone|od)/.test(b),c.isAndroid=/Android/i.test(b),c.isOthers=!c.isIOS&&!c.isAndroid,c.platform={},c.platform.wechat=/MicroMessenger/i.test(b),c.platform.lls=!!a.get("token"),c}),define("libs/native",[],function(){"use strict";return{share:function(a,b){window.location.href="lls://share/"+encodeURIComponent(a)+"/"+encodeURIComponent(b)},back:function(){window.location.href="lls://back"},addModule:function(a){window.location.href="lls://module/"+a+"/add"}}}),define("libs/audio-player",[],function(){"use strict";var a=function(){function a(){return e||(e=document.getElementById(g),e||(e=document.createElement("audio"),e.id=g,document.body.appendChild(e),e.addEventListener("ended",b,!1))),e}function b(){e&&e.pause(),f&&(f.classList.remove("stop"),f=null),d&&d.call(null)}function c(c){if(a(),f===c)e.play();else{var d=c.getAttribute("data-src");d&&(c.classList.add("stop"),b(),e.src=d,e.play(),f&&f.classList.remove("stop"))}f=c}var d,e,f,g="__player_id__";return document.addEventListener("click",function(a){var d=a.target,e=d.classList;e.contains("audio-control")&&!e.contains("disabled")&&(e.contains("stop")?(b(),e.remove("stop")):c(d))},!1),{play:c,stop:b,onEnd:function(a){return d=a,this}}}();return a}),define("init",["libs/utils","libs/Agent","libs/storage","libs/native","libs/audio-player"],function(a,b,c,d){"use strict";function e(){var a=null;["webkitApplicationCache","mozApplicationCache","msApplicationCache","applicationCache"].forEach(function(b){b in window&&(a=window[b])}),a&&window.addEventListener("load",function(){a.addEventListener("updateready",function(){a.status===a.UPDATEREADY&&window.location.reload()},!1)},!1)}function f(){b.platform.wechat&&(a.__(".download-btns .btn").forEach(function(a){a.setAttribute("href","http://a.app.qq.com/o/simple.jsp?pkgname=com.liulishuo.engzo&g_f=991653")}),document.addEventListener("WeixinJSBridgeReady",function(){var a=location.href.split("?").shift()+"?share=yes#game",b="英语流利说：测测你的另一半";WeixinJSBridge.on("menu:share:appmessage",function(){WeixinJSBridge.invoke("sendAppMessage",{img_url:"http://api.llsapp.com/ops-activity/images/wechat-logo.png",link:a,desc:c.get("worldcup-result"),title:b},function(){})}),WeixinJSBridge.on("menu:share:timeline",function(){WeixinJSBridge.invoke("shareTimeline",{img_url:"http://api.llsapp.com/ops-activity/images/wechat-logo.png",link:a,desc:c.get("worldcup-result"),title:b},function(){})})},!1)),b.isIOS?a._(".download-ios").classList.remove("hidden"):b.isAndroid&&a._(".download-android").classList.remove("hidden"),a._(".share-ad").classList.remove("hidden")}return function(g,h){e();var i=h.params.token,j=h.params.version,k=h.params.appId,l=h.params.deviceId;if(i&&c.set("token",i),j&&c.set("version",j),k&&c.set("app_id",k),l&&c.set("device_id",l),"yes"===h.params.share&&f(),b.isIOS){var m=a._("#ios-relative");m&&m.classList.add("ios-declare")}if(b.isIOS||b.platform.wechat){var n=a._("body > header");n&&(n.style.display="none")}else{var o=a._(".header-left a");o&&o.addEventListener("click",function(a){o.classList.contains("back-to-app")?d.back():window.history.back(),a.preventDefault()},!1)}}}),define("libs/lucky-plate",["libs/utils"],function(a){"use strict";function b(b,c,d){a.css(b,"transitionDuration",d+"ms"),a.css(b,"transform","rotate("+c+"deg) translateZ(0px)")}function c(b){return h*a.circle(g-b,g)}function d(){"function"==typeof f&&f(j)}function e(a){k||(a.addEventListener("webkitTransitionEnd",d,!1),a.addEventListener("msTransitionEnd",d,!1),a.addEventListener("oTransitionEnd",d,!1),a.addEventListener("otransitionend",d,!1),a.addEventListener("transitionend",d,!1),k=!0)}var f,g=12,h=360/g,i=0,j=0,k=!1;return{run:function(d,h,k,l,m){var n,o,p=a._(".cards",d);e(p),f=k.runEnd,h="number"==typeof h?h:Math.round(2*Math.random()*g),h=a.circle(h,g),l=l||2,m=m||3e3,n=c(h),o=l*m/1e3+2;var q;i>0?(q=Math.ceil(i/360),n=360*(q-o)+n):(q=Math.floor(i/360),n=360*(q+o)+n),i=n,j=h,k.runStart&&k.runStart(),b(p,n,m)}}}),define("worldcup/data",[],function(){"use strict";return{game_result:{woman:"哇塞，#{username} 理想的另一半是#{starname}啊，你羡慕吗？",man:"哇，#{username} 日思夜想的好基友是#{starname}啊，你也来认领一个！"},stars:{"01":{nick:"球王",name:"贝利",desc:"世界级足球偶像，拥有三届FIFA世界杯冠军的骄人战绩，无可超越的足球天才。"},"02":{nick:"外星人",name:"罗纳尔多",desc:"一个传奇般的球员，来自足球的天堂巴西。给他一双足球鞋，他可以撬动球场。"},"03":{nick:"忧郁王子",name:"巴乔",desc:"你可曾记得他那湛蓝的双眼和标志性的马尾辫造型？曾经的那个孤独背影，让我们感同什么是痛彻心扉！"},"04":{nick:"金色轰炸机",name:"克林斯曼",desc:"“德国三驾马车”的排头兵，“日耳曼战车”的突击营，祝福这位曾经的国米战士，感谢他对蓝黑军团所做的一切。"},"05":{nick:"凯撒大帝",name:"贝肯鲍尔",desc:"世界足球史上的一个奇迹，他被看作是“足球皇帝”；他的名字在联邦德国家喻户晓、人人皆知。"},"06":{nick:"球王",name:"马拉多纳",desc:"被认为足球史上最优秀亦是最具争议的球员，其盘带技术和突破能力让世人为之惊叹，他是足球场上的“上帝”。"},"07":{nick:"战神",name:"巴蒂斯图塔",desc:"他进球后张开双臂狂奔，长发随之舞动，呐喊响彻球场。他云集了体育史上一切可以激发雄性荷尔蒙的幻想元素。"},"08":{nick:"罗马王子",name:"托蒂",desc:"他是罗马城的象征，他是潇洒的舞者，他是执着的斗士！你不看足球，所以你不知道有一种忠诚叫托蒂。"},"09":{nick:"黑天鹅",name:"里杰卡尔德",desc:"有非常抢眼的方便面头型，“荷兰三剑客”之一，AC米兰王朝的缔造者之一，巴萨走向欧洲之巅的引领者。"},10:{nick:"乌克兰核弹头",name:"舍普琴科",desc:"无数个金靴奖，无数个联赛冠军，这是曾经最强大的前锋，他是我们心中的“足球先生”，他是乌克兰的民族英雄。"},11:{nick:"追风少年",name:"欧文",desc:"他是1998年世界杯上最清新的一道风，他被誉为英格兰金童，他是欧文，那个在夕阳下奔跑的追风少年！"},12:{nick:"猎豹",name:"埃托奥",desc:"喀麦隆藉足球运动员，嗅觉敏锐，速度犹如猎豹，曾三次获得欧冠冠军，四次获得非洲足球先生。"},13:{nick:"魔兽",name:"德罗巴",desc:"他是顶级后卫的梦魇，灵敏的门前嗅觉，果断的临门一脚，惊人的爆发力，“魔兽”之威名扬四海。"},14:{nick:"万人迷",name:"贝克汉姆",desc:"他是衣柜里红色的7号球衣，是墙上英俊的英格兰帅哥，是那些年为英格兰流过的遗憾之泪，小贝，青春印记。"},15:{nick:"小跳蚤",name:"梅西",desc:"四座金球奖，创造91球年度进球纪录，27岁已为人父的梅西依然在谱写自己的纪录，梅西在路上！"},16:{nick:"好好先生",name:"卡卡",desc:"左手是对爱情的忠贞，右手是对上帝的虔诚，他告诉我们青春，教会我们责任。卡卡，世界好好先生。"},17:{nick:"高富帅",name:"C罗",desc:"从04年泪洒赛场的少年到如今君临天下的金球先生，他桀傲刚强，沸反盈天，闪耀在世界之巅！"},18:{nick:"斑马王子",name:"皮耶罗",desc:"他身披斑马战袍征战18个赛季，他代表尤文图斯出场705次，打进290球，他是意大利足球史上最伟大最具象征性的球员之一！"},19:{nick:"罗宾侠",name:"范佩西",desc:"他拥有一只能拉小提琴的左脚，是欧洲技术型前锋的代表人物，“谁能横刀立马，唯我范大将军”。"},20:{nick:"K神",name:"克洛泽",desc:"两德统一后首位世界杯金靴奖得主，德国历史第一射手，多次获得公平竞赛奖，被国际足联主席布拉特称为“足球圣人”。"},21:{nick:"小坦克",name:"鲁尼",desc:"他用一脚惊艳吊射戏耍了希曼，也让全英从此记住了他的名字！鲁尼，他是曼联的新国王。"},22:{nick:"长颈鹿",name:"范德萨",desc:"1998年世界杯上小毛驴的冲天一顶让世界知道了这个长颈鹿门神，足球史上最优秀的门将。"},23:{nick:"大竹杆",name:"克劳奇",desc:"他是利物浦历史上最高的球员，也是英超目前最高的人。他的脚下技术、控带以及护球能力极强，他是一个增高版的技术型前锋。"},24:{nick:"指环王",name:"劳尔",desc:"他是皇家马德里永远的队长，他亲吻戒指的庆祝方式更是一个时代的记忆。"},25:{nick:"“金童”，“圣婴”",name:"托雷斯",desc:"7岁遇到现在的妻子，17岁正式交往，从此再没其他女人；他以金童身份出现在人们的视野，年仅19岁成为马德里竞技历史上最年轻队长。"},26:{nick:"齐祖",name:"齐达内",desc:"从1996年欧洲杯崭露头角，到1998年世界杯扬名立万，再到2006年世界杯光辉，他遗憾谢幕。"}}}}),define("libs/dialog",[],function(){"use strict";function a(a,b){var c,d;for(c=0,d=a.length;d>c;++c)b(a[c],c)}function b(b,c){c=c||{},c.closeOnMask="undefined"==typeof c.closeOnMask?!0:!!c.closeOnMask;var d,e=this;if(d=b.nodeType?b:document.querySelector(b),!d)throw new Error("Dialog("+b+") not exist");var g=d.parentNode;g&&g.classList.contains(f)||(g=document.createElement("div"),g.classList.add(f),g.appendChild(d),j.appendChild(g)),c.closeOnMask&&g.addEventListener("click",function(a){a.target.classList.contains(f)&&e.close()},!1),c.timeout&&setTimeout(function(){e.close()},c.timeout),d.style.display="block",g.style.display="block";var h=window.getComputedStyle(d),i=h.height;d.style.display="none",g.style.display="none",d.style.height=i,a(["left","top","right","bottom"],function(a){d.style[a]="0"}),this.container=d,this.mask=g,this.isOpened=!1}function c(a,c,d,e,f){var g=k.replace("{msg}",a);if("function"!=typeof c){var h=c;c=d,d=h}d=d||{},d.btns=d.btns||f;var i,l="";for(i in d.btns)l+='<a href="" data-key="'+i+'" class="btn btn-'+i+'">'+d.btns[i]+"</a>";g=g.replace("{btns}",l),e.innerHTML=g,e.style.display="none",j.appendChild(e);var m=new b(e,d),n=function(a){var b;if("function"==typeof c){var d=a.target.getAttribute("data-key");b=c("sure"===d?!0:"cancel"===d?!1:d)}b!==!1&&m.close(),a.preventDefault()};for(i in d.btns)e.querySelector(".btn-"+i).addEventListener("click",n);return m.open(),m}function d(a,b,d){var e=document.createElement("div");e.classList.add("dialog"),e.classList.add("dialog-confirm");var f={sure:"确定",cancel:"取消"};return c(a,b,d,e,f)}function e(a,b,d){var e=document.createElement("div");e.classList.add("dialog"),e.classList.add("dialog-alert");var f={sure:"确定"};return c(a,b,d,e,f)}var f="__dialog-mask",g="__dialog-lock",h=document.documentElement,i=0,j=document.body;b.prototype={getContainer:function(){return this.container},open:function(){return this.isOpened||(this.container.style.display="block",this.mask.style.display="block",i++,h.classList.add(g)),this.isOpened=!0,this},close:function(a){return this.isOpened&&(this.container.style.display="none",this.mask.style.display="none",i--,0===i&&h.classList.remove(g),this.mask&&("undefined"==typeof a||a)&&(this.mask.parentNode.removeChild(this.mask),this.container=null,this.mask=null)),this.isOpened=!1,this}};var k='<div class="content"><p class="msg">{msg}</p></div><div class="btns">{btns}</div>';return b.confirm=d,b.alert=e,b.tpl=function(a,c){var d=document.createElement("div");d.className="dialog "+(c?c:""),d.innerHTML=a;var e=new b(d);return e.open()},b}),define("libs/agent",["libs/storage"],function(a){"use strict";var b=navigator.userAgent,c={};return c.isIOS=/iP(ad|hone|od)/.test(b),c.isAndroid=/Android/i.test(b),c.isOthers=!c.isIOS&&!c.isAndroid,c.platform={},c.platform.wechat=/MicroMessenger/i.test(b),c.platform.lls=!!a.get("token"),c}),define("worldcup/game",["libs/utils","libs/lucky-plate","worldcup/data","libs/dialog","libs/agent","libs/storage"],function(a,b,c,d,e,f){"use strict";return function(g,h){function i(){m.style.visibility="hidden";var b,c=[];for(b in p)q.push(b);q=a.shuffle(q).slice(0,l),a.each(q,function(a){c.push("<li><span>"+p[a].name+"</span></li>")}),a._(".cards ul",m).innerHTML=c.join(""),m.style.visibility="visible"}function j(b){var g=q[b],i=p[g];i.avatar="images/stars/"+g+".png";var j=a._("#woman").checked?"woman":"man",k=a.trim(o.value);i.result=a.render(c.game_result[j],{username:k,starname:i.name}),f.set("worldcup-result",i.result),a.delay(300,function(){n.classList.remove("disabled");var b=d.tpl(a.render(r,i),"dialog-game-end");a._(".btn-beg-bless",b.getContainer()).addEventListener("click",function(c){if(b.close(),!e.platform.lls)return d.alert("想要更多惊喜吗？登录英语流利说吧"),c.preventDefault(),!1;b=d.tpl(a.render(s,i),"dialog-share");var f=b.getContainer();a._(".btn-cancel",f).addEventListener("click",function(a){b.close(),a.preventDefault()}),a._(".btn-sure",f).addEventListener("click",function(a){h&&h(i.result),a.preventDefault()}),c.preventDefault()},!1)})}function k(){return a.trim(o.value).length>=1}var l=12,m=a._(".game"),n=a._(".lucky-plate .start"),o=a._("#name"),p=c.stars,q=[],r='<div class="result"><img src="#{avatar}"><p>#{result}</p></div><div class="intro"><h1><span class="star-nick">#{nick}</span>&nbsp;<span class="star-name">#{name}</span></h1><p>#{desc}</p><a href="" class="btn btn-beg-bless">求祝福</a></div>',s='<div class="result"><img src="#{avatar}"><p>#{result}</p><p class="from">from 英语流利说</p></div><div class="btns"><a href="" class="btn btn-orange btn-sure">分享</a><a href="" class="btn btn-cancel">取消</a><div>';i(),n&&n.addEventListener("click",function(){if(!k())return d.alert("请输入您的大名",{timeout:2e3}),!1;n.classList.add("disabled");var c=Math.round(13*Math.random());b.run(a._(".lucky-plate"),c,{runEnd:j,runStart:g})},!1)}}),define("libs/url-parser",[],function(){"use strict";function a(a,b,d){if("undefined"!=typeof b){var e=a.match(c);e?(a=e[1],e[2]?(d[a]=d[a]||{},d[a][e[2]]=b):(d[a]=d[a]||[],d[a].push(b))):d[a]=b}}function b(b){var c=document.createElement("a");return c.href=b,{source:b,protocol:c.protocol.replace(":",""),host:c.hostname,port:c.port,query:c.search,params:function(){for(var b,d={},e=c.search.substr(1).split("&"),f=e.length,g=0;f>g;g++)e[g]&&(b=e[g].split("="),a(b[0],b[1],d));return d}(),file:(c.pathname.match(/\/([^\/?#]+)$/i)||[,""])[1],hash:c.hash.replace("#",""),path:c.pathname.replace(/^([^\/])/,"/$1")}}var c=/([-_\w]+)\[([-_\w]*)\]/;return b}),define("libs/router",["libs/url-parser"],function(a){"use strict";var b=a(location.href),c=b.path;"/"===c.charAt(0)&&(c=c.substr(1)),c.lastIndexOf(".")>=0&&(c=c.substring(0,c.lastIndexOf("."))),""===c&&(c="index");var d={};return{all:function(a){return this.on("_all_",a)},on:function(a,e){return d[a]=!0,(c===a||"_all_"===a)&&"function"==typeof e&&e.call(this,c,b),this},other:function(a){return c in d||"function"==typeof a&&a.call(this,c,b),this}}}),define("libs/partial",[],function(){"use strict";function a(a,b){var c=document.querySelectorAll("."+a);if(c&&"function"==typeof b)for(var d=0;d<c.length;++d)b.call(c,c[d],d);return c}return function(b,c){1===arguments.length&&(c=b,b="partial"),a(b,function(a){var d=a.getAttribute("data-"+b);d?(d=","+d.split(/\s*,\s*/).join(",")+",",d.indexOf(c)>=0?a.classList.remove("hidden"):a.classList.add("hidden")):a.classList.add("hidden")})}}),define("libs/ajax",["libs/utils"],function(a){"use strict";function b(a,b){var c=b.context;return b.beforeSend.call(c,a,b)===!1?!1:void 0}function c(a,b,c){var d=c.context,f="success";c.success.call(d,a,f,b),e(f,b,c)}function d(a,b,c,d){var f=d.context;d.error.call(f,c,b,a),e(b,c,d)}function e(a,b,c){var d=c.context;c.complete.call(d,b,a)}function f(a){return a&&(a=a.split(";",2)[0]),a&&(a===m?"html":a===l?"json":j.test(a)?"script":k.test(a)&&"xml")||"text"}function g(b){if(b.processData&&b.data&&"string"!=typeof b.data){var c,d=[];for(c in b.data)d.push(c+"="+encodeURIComponent(b.data[c]));b.data=d.join("&").replace(/%20/g,"+")}!b.data||b.type&&"GET"!==b.type.toUpperCase()||(b.url=a.appendQuery(b.url,b.data),b.data=void 0)}function h(e){var h=a.extend({},o,e||{});h.url||(h.url=window.location.toString()),h.crossDomain||(h.crossDomain=/^([\w-]+:)?\/\/([^\/]+)/.test(h.url)&&RegExp.$2!==window.location.host),g(h),h.cache===!1&&(h.url=a.appendQuery(h.url,"_="+Date.now()));var j,k=h.dataType,l=h.accepts[k],m={},p=function(a,b){m[a.toLowerCase()]=[a,b]},q=/^([\w-]+:)\/\//.test(h.url)?RegExp.$1:window.location.protocol,r=h.xhr(),s=r.setRequestHeader;h.crossDomain||p("X-Requested-With","XMLHttpRequest"),p("Accept",l||"*/*"),l=h.mimeType,l&&(l.indexOf(",")>-1&&(l=l.split(",",2)[0]),r.overrideMimeType&&r.overrideMimeType(l)),(h.contentType||h.contentType!==!1&&h.data&&"GET"!==h.type.toUpperCase())&&p("Content-Type",h.contentType||"application/x-www-form-urlencoded");var t;if(h.headers)for(t in h.headers)p(t,h.headers[t]);if(r.setRequestHeader=p,r.onreadystatechange=function(){if(4===r.readyState){r.onreadystatechange=i,clearTimeout(j);var a,b=!1;if(r.status>=200&&r.status<300||304===r.status||0===r.status&&"file:"===q){k=k||f(h.mimeType||r.getResponseHeader("content-type")),a=r.responseText;try{"script"===k?(1,eval)(a):"xml"===k?a=r.responseXML:"json"===k&&(a=n.test(a)?null:JSON.parse(a))}catch(e){b=e}b?d(b,"parsererror",r,h):c(a,r,h)}else d(r.statusText||null,r.status?"error":"abort",r,h)}},b(r,h)===!1)return r.abort(),d(null,"abort",r,h),r;var u="async"in h?h.async:!0;r.open(h.type,h.url,u,h.username,h.password);for(t in m)s.apply(r,m[t]);return h.timeout>0&&(j=setTimeout(function(){r.onreadystatechange=i,r.abort(),d(null,"timeout",r,h)},h.timeout)),r.send(h.data?h.data:null),r}var i=function(){},j=/^(?:text|application)\/javascript/i,k=/^(?:text|application)\/xml/i,l="application/json",m="text/html",n=/^\s*$/,o={type:"GET",beforeSend:i,success:i,error:i,complete:i,xhr:function(){return new window.XMLHttpRequest},accepts:{script:"text/javascript, application/javascript, application/x-javascript",json:l,xml:"application/xml, text/xml",html:m,text:"text/plain"},timeout:0,processData:!0,cache:!1};return h}),define("worldcup/api",["libs/env","libs/storage","libs/ajax"],function(a,b,c){"use strict";var d;return d=a.isLocal?"http://staging.llsapp.com/api/:version:/activities/5388424b0af9963bf3000001":a.isStaging?"http://staging.llsapp.com/api/:version:/activities/5388424b0af9963bf3000001":"http://api.llsapp.com/api/:version:/activities/538d74befcfff2990a000001",function(a,e){e=e||{};var f=b.get("device_id"),g=b.get("app_id"),h=b.get("version")||"events";e.url=d.replace(":version:",h)+a,e.type=e.type||"get",e.dataType=e.dataType||"json",e.data=e.data||{},e.data.token=e.data.token||b.get("token"),f&&(e.data.deviceId=f),g&&(e.data.appId=g),c(e)}}),require.config({paths:{zepto:"../bower_components/zepto/zepto",hammer:"../bower_components/hammerjs/hammer"},shim:{zepto:{exports:"Zepto"}}}),require(["libs/stat","init","worldcup/game","libs/utils","libs/router","libs/dialog","libs/native","libs/partial","libs/agent","worldcup/api"],function(a,b,c,d,e,f,g,h,i,j){"use strict";function k(){function b(){var a,b=parseInt(l.users_count,10)||0,c=200;a=100*(c-b)/c,d._(".progress .mask").style.width=a+"%";var e=d._(".progress .title"),f=e.innerText||e.textContent;e.innerText=f.replace(/\d+/,b);var g=d._(".progress .finish-rate");f=g.innerText||e.textContent,a=Math.round(1e3*b/c)/10,g.innerText=f.replace(/\d+\%/,a+"%")}function e(c){if(k)if(m)if(k.have_content_module)f.alert("您已成功购买",{btns:{cancel:"取消"}});else if(r[l._status].coin>m.coin)f.alert("您的钻石余额不足，请先去充值");else{var d=r[l._status].coin/10,e=r[l._status].confirm;a.gaTrack("buy_course","click",d+"元购买课程"),f.confirm(e,function(c){c&&j("/"+l.type,{type:"POST",success:function(){a.gaTrack("buy_course","result",d+"元购买课程成功"),k.have_content_module=!0,m.coin=m.coin-r[l._status].coin,"group"===l._status?(l.users_count++,b(),f.alert("预购课程成功！")):g.addModule(k.content_module_id)},error:function(){a.gaTrack("buy_course","result",d+"元购买课程失败"),f.alert("网络繁忙，请稍后再试")}})})}else f.alert(i.platform.lls?"您尚末登录":"先登录英语流利说");else f.alert("网络繁忙，请稍后再试");c.preventDefault()}c(function(){a.gaTrack("play_game","click","开始游戏点击"),j("/lottery",{type:"POST"})},function(b){a.gaTrack("share","click","分享点击",function(){var a=location.href.split("?").shift()+"?share=yes#game";g.share(a,b)})});var k,l,m,n=[],o="content_module",p={crowdfunding:"group",content_module:"normal",seckill:"second"};for(var q in p)n.push(q);var r={group:{confirm:"预购课程会从您账户中扣除60颗流利钻，确认报名？",coin:60},normal:{confirm:"秒杀课程会从您账户中扣除90颗流利钻，确认报名？",coin:90},second:{confirm:"购买课程会从您账户中扣除240颗流利钻，确认报名？",coin:240}};j("/",{success:function(a){k=a&&a.activity,m=a&&a.user,l=k.events&&k.events[0]||{};var c=l&&d.indexOf(n,l.type)>-1?l.type:o;c=p[c],l._status=c,"group"===c&&b(),h(c)},error:function(){f.alert("网络繁忙，请稍后再试")}}),d._("#btn-group").addEventListener("click",e,!1),d._("#btn-second").addEventListener("click",e,!1),d._("#btn-normal").addEventListener("click",e,!1),window.partial=h,window.Dialog=f}function l(){j("/rank_list",{success:function(a){console.log(a)},error:function(){}})}e.all(b).on("index",k).on("leaderboard",l).other(k)}),define("main",function(){})}();