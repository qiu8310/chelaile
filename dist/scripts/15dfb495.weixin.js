!function(){define("libs/env",[],function(){"use strict";var a={},b=location.host;return a.isStaging="staging.llsapp.com"===b,a.isLocal=0===b.indexOf("localhost")||0===b.indexOf("192.168"),a.isOnline=!a.isLocal&&!a.isStaging,a}),define("libs/stat",["libs/env"],function(a){"use strict";function b(a,b,c){if(/\bdebug=true\b/i.test(location.search)){var d=a.innerText?"innerText":"textContent";a[d]=c||void 0===c?a[d]+"\r\n"+b:b}}var c,d=_gaq,e={};c={gaTrack:function(b,c,e,f){var g=arguments[arguments.length-1];"string"!=typeof e&&(e=void 0),"number"!=typeof f&&(f=void 0),d&&d.push&&a.isOnline&&d.push(["_trackEvent",b,c,e,f]),"function"==typeof g&&(d&&d.push?setTimeout(g,200):g())},log:function(b,c,d,e,f){var g="http://fcbst.sinaapp.com/log.php?from="+encodeURIComponent(c)+"&type="+encodeURIComponent(b);"undefined"!=typeof d&&(g+="&msg="+encodeURIComponent(d)),"undefined"!=typeof e&&(g+="&data="+encodeURIComponent(JSON.stringify(e))),(a.isOnline||f)&&((new Image).src=g+"&_="+Date.now());var h="Stat#log:\n Category [%s]\n Msg [%s]\n Data [%o]";console[console[b]?b:"log"](h,c,d,e)},remote:function(a,b,d){d=d||{},d.url=location.href,d.ua=navigator.userAgent,c.log(a,"remote message",b,d,!0)}},c.local={};var f=function(a){var c=document.querySelector(".debug");c||(c=document.createElement("div"),c.className="debug",document.body.appendChild(c));var d=document.createElement("div");return d.className=a,c.appendChild(d),function(){var a=[].slice.call(arguments,0),c=[],e=!0;"boolean"==typeof a[a.length-1]&&(e=a.pop()),a.forEach(function(a){if("object"==typeof a)try{a=JSON.stringify(a)}catch(b){a=a.toString()}c.push(a)}),b(d,c.join(", "),e)}};return["success","warning","log","info","error"].forEach(function(a){c.local[a]=f(a)}),window.onerror=function(a,b,d){if(!e.onbeforeunload){if("object"==typeof a){var f=a;d=f.line,a=f.message?f.name+": "+f.message:f.toString()}c.log("error","appevent",a,{url:location.href,src:b,line:d,ua:navigator.userAgent})}return!0},window.onbeforeunload=function(){e.onbeforeunload=!0},c}),define("libs/event",[],function(){"use strict";function a(a){if(!a)return g;for(var b=a.split("."),c=g,d=0;d<b.length;++d)b[d]in c||(c[b[d]]={}),c=c[b[d]];return c}function b(b,c,d,e){var f=a(b);i in f||(f[i]=[]),f[i].push([c,d,b,e])}function c(a,b,d){for(var e in a)if(i===e)for(var f=a[i].length-1;f>=0;f--)b&&a[i][f][0]&&a[i][f][0]!==b||d&&a[i][f][1]&&a[i][f][1]!==d||(a[i].splice(f,1),0===a[i].length&&delete a[i]);else c(a[e],b,d)}function d(a,b,c,e){for(var f in a)if(f===i)if(a[f].length>0)for(var g,h=a[f].length,j=0;h>j;++j)g=a[f][j],b[0].onType=g[2],b[0].data=g[3],e===g[1]&&g[0].apply(c||g[1],b);else delete a[f];else d(a[f],b,c,e)}function e(a){return h.indexOf(a)>=0||h.indexOf(a.constructor&&a.constructor.prototype)>=0?a:f}var f,g={},h=[],i="i__ctxs__i";return f={trigger:function(b,c,f){var g=e(this);return b.split(/\s+/).forEach(function(b){var e=a(b);c=c||[],c.unshift({type:b.split(".").shift(),triggerType:b,target:g}),d(e,c,f,g)}),g},on:function(a,c,d){var f=e(this);return"function"==typeof c&&(d=c,c=null),a.split(/\s+/).forEach(function(a){b.call(g,a,d,f,c)}),f},off:function(b,d){var f=e(this);return 0===arguments.length?void c.call(g,g,d,f):(1===arguments.length&&"function"==typeof b&&(d=b,b=null),b.split(/\s+/).forEach(function(b){var e=a(b);c.call(g,e,d,f)}),f)},wrap:function(a){return a||(a={}),["trigger","on","off"].forEach(function(b){a[b]=f[b]}),h.push(a),a}}}),define("libs/storage",[],function(){"use strict";var a=window.localStorage;return{set:function(b,c){a&&(a[b]=c)},get:function(b){return a&&a[b]},del:function(b){a&&a.removeItem(b)}}}),define("libs/agent",["libs/storage"],function(a){"use strict";var b=navigator.userAgent,c={};return c.isIOS=/iP(ad|hone|od)/.test(b),c.isAndroid=/Android/i.test(b),c.isOthers=!c.isIOS&&!c.isAndroid,c.platform={},c.platform.wechat=/MicroMessenger/i.test(b),c.platform.lls=!!a.get("token"),c}),define("libs/wechat",["libs/stat","libs/agent","libs/event"],function(a,b,c){"use strict";function d(c){return"undefined"==typeof WeixinJSBridge?(b.platform.wechat?a.remote("error","WeixinJSBridge not defined"):console.error("WeixinJSBridge not defined"),!1):c()}function e(){var a=[].slice.call(arguments,0);d(function(){WeixinJSBridge.call.apply(WeixinJSBridge,a)})}function f(){var a=[].slice.call(arguments,0);d(function(){WeixinJSBridge.on.apply(WeixinJSBridge,a)})}function g(b,c,e){d(function(){"function"==typeof c&&(e=c,c={}),WeixinJSBridge.invoke(b,c,function(d){"function"==typeof e?e(d):e&&a.remote("info","WeixinJSBridge invoke "+b+" callback",{params:c,res:d})})})}function h(a,b){return/\s*:\s*ok\b/i.test(b)}function i(a,b,c,d){c=c||{},d=d||{};var e;for(e in d)b[e]=d[e];if(b.def)for(e in b.def)c[e]||(c[e]=b.def[e]);if(b.mandatory){var f,i=b.mandatory.length;for(f=0;i>f;++f)if(!(b.mandatory[f]in c))throw new Error("Wechat invoke "+a+" absence argument "+b.mandatory[f])}g(a,c,function(c){var d,e=[].slice.call(arguments,0);b.expect?"function"==typeof b.expect?d=b.expect.apply(null,e):"string"==typeof b.expect&&(b.expect=[b.expect]):d=h(a,c.err_msg);var f,g={};b.expect&&b.expect.length>0&&(f="undefined"==typeof b.expectAll?!0:!!b.expectAll,d=f,b.expect.forEach(function(a){g[a]=c[a];var b=a in c;b&&!f?d=!0:!b&&f&&(d=!1)})),b.complete&&b.complete.apply(null,e),d===!0&&b.success?(b.expect&&b.expect.length>0&&e.unshift(g),b.success.apply(null,e)):d===!1&&b.error&&b.error.apply(null,e)})}function j(b,c,d){if(!(b in l)||"function"!=typeof c)return a.remote("error","Wechat _listenMenu error"),!1;var e=l[b];f(e[0],function(){g(e[1],c.call(null,e[0],e[1]),d)})}function k(b){return function(){a.local.info("Event: "+b,arguments[0]),m.trigger(b,[].slice.call(arguments,0))}}var l={shareToFrient:["menu:share:appmessage","sendAppMessage"],shareToTimeline:["menu:share:timeline","shareTimeline"],shareToWeibo:["menu:share:weibo","shareWeibo"]},m={call:e,invoke:g,shareToFrient:function(a,b){j("shareToFrient",a,b)},shareToTimeline:function(a,b){j("shareToTimeline",a,b)},shareToWeibo:function(a,b){j("shareToWeibo",a,b)},getNetworkType:function(a){g("getNetworkType",{},function(b){var c=b.err_msg.split(":");c&&(c=c[1]),a&&a(c)})},close:function(){e("closeWindow")},hideOptionMenu:function(){e("hideOptionMenu")},showOptionMenu:function(){e("showOptionMenu")},hideToolbar:function(){e("hideToolbar")},showToolbar:function(){e("showToolbar")},pickImages:function(a,b){1===arguments.length&&(b=a,a={}),i("pickLocalImage",{def:{scene:"1|2"},expect:"localIds"},a,b)},uploadImage:function(a,b){i("uploadLocalImage",{mandatory:["localId","appId"],expect:"serverId"},a,b)},downloadImage:function(a,b){i("downloadImage",{mandatory:["serverId"],expect:"localId"},a,b)},recordVoice:function(a,b){i("startRecord",{mandatory:["appId"],expect:["localId"]},a,b)},playVoice:function(a,b){i("playVoice",{mandatory:["appId","localId"]},a,b)},pauseVoice:function(a,b){i("pauseVoice",{mandatory:["appId","localId"]},a,b)},stopVoice:function(a,b){i("stopVoice",{mandatory:["appId","localId"]},a,b)},uploadVoice:function(a,b){i("uploadVoice",{mandatory:["appId","localId"],expect:"serverId"},a,b)},downloadVoice:function(a,b){i("downloadVoice",{mandatory:["appId","serverId"],expect:"localId"},a,b)}};c.wrap(m);var n=m.on,o={imageupload:{old:"onLocalImageUploadProgress"},imagedownload:{old:"onImageDownloadProgress"},voiceupload:{old:"onVoiceUploadProgress"},voicedownload:{old:"onVoiceDownloadProgress"},voiceend:{old:"onVoicePlayEnd"},voicebegin:{old:"onVoicePlayBegin"}};return m.on=function(a){a.split(/\s+/).forEach(function(a){var b=a.split(".").shift();b in o&&!o[b].inited&&(o[b].inited=!0,f(o[b].old,k(b)))}),n.apply(m,[].slice.call(arguments,0))},b.platform.wechat&&(m.supported=!0),m}),define("libs/wechat-voice",["libs/event","libs/wechat"],function(a,b){"use strict";function c(a,b,c){if(c=c||{},this.status=d.STOPPED,!b||!a)throw new Error("Absence arguments for new Voice()");this.id=b.replace(/[^\w]/g,""),this.localId=b,this.appId=a,f[b]=this}var d={STOPPED:1,PLAYING:2},e={};a.wrap(e);var f={};return c.record=function(a,d){var e=d.success;d.success=function(b){var d=new c(a.appId,b.localId);e.call(null,d)},b.recordVoice(a,d)},c.prototype={upload:function(a,c){var d=this;return d.serverId?void(a&&a(d.serverId)):void b.uploadVoice({appId:d.appId,localId:d.localId},{success:function(b){d.serverId=b.serverId,a&&a.call(d,b.serverId)},error:function(a){c&&c.call(d,a),d.trigger("error",[{type:"uploadError",msg:a.err_msg}])}})},play:function(){if(this.status!==d.PLAYING){var a=this;b.playVoice({appId:this.appId,localId:this.localId},{complete:function(){a.status=d.PLAYING},error:function(b){a.trigger("error",[{type:"playError",msg:b.err_msg}],a)}})}},stop:function(){if(this.status!==d.STOPPED){var a=this;b.stopVoice({appId:this.appId,localId:this.localId},{complete:function(){a.status=d.STOPPED},error:function(b){a.trigger("error",[{type:"stopError",msg:b.err_msg}],a)}})}},destroy:function(){this.off(),f[this.localId]=null,delete f[this.localId]},isPlaying:function(){return this.status===d.PLAYING},isStopped:function(){return this.status===d.STOPPED}},a.wrap(c.prototype),b.supported&&b.on("voicebegin voiceend",function(a,b){if(b.localId&&b.localId in f){var c="voicebegin"===a.type?"play":"end",e=f[b.localId];e.trigger(c,[],e),e.status="play"===c?d.PLAYING:d.STOPPED}}),c}),define("libs/utils",[],function(){"use strict";var a={_:function(a,b){return(b||document).querySelector(a)},__:function(a,b){return[].slice.call((b||document).querySelectorAll(a))},each:function(a,b){for(var c=0;c<a.length;++c)b(a[c],c)},indexOf:function(a,b){if(a.indexOf)return a.indexOf(b);for(var c=0;c<a.length;c++)if(a[c]===b)return c;return-1},extend:function(a,b){if(arguments.length<2)return arguments[0];for(var c,d=1;d<arguments.length;++d){b=arguments[d];for(c in b)a[c]=b[c]}return a},appendQuery:function(a,b){if(""===b)return a;var c=a.split("#");return(c[0]+"&"+b).replace(/[&?]{1,2}/,"?")+(2===c.length?"#"+c[1]:"")},delay:function(a,b){setTimeout(b,a)},random:function(a,b){return"undefined"==typeof b&&(b=a,a=0),a+Math.floor(Math.random()*(b-a+1))},shuffle:function(b){for(var c,d,e=[],f=0;f<b.length;f++)d=b[f],c=a.random(f),e[f]=e[c],e[c]=d;return e},toString:function(a){return Object.prototype.toString.call(a)},trim:function(a){return a.replace(/^\s+|\s+$/g,"")},onInputChange:function(b,c){function d(){c&&c(a.trim(b.value))}b.addEventListener("change",d,!1),b.addEventListener("keyup",d,!1)},escapeHTML:function(a){var b=document.createElement("div"),c=document.createTextNode(a);return b.appendChild(c),b.innerHTML},render:function(b,c,d,e){return e="undefined"==typeof e?!0:!!e,d="undefined"==typeof d?!0:!!d,b=b.replace(/#\{([\w\-_]+)\}/g,function(b,d){return d in c?e?a.escapeHTML(c[d]):c[d]:""}),d||(b=b.replace(/#\{&([\w\-_]+)\s*\?\s*([^:]*?)\s*:\s*([^\}]*?)\s*\}/g,function(a,b,d,e){return c[b]?d:e}),b=b.replace(/#\{&repeat\s+([\w\-_]+)\s+([^\}]*?)\}/g,function(b,d,f){var g="";return d in c&&"[object Array]"===a.toString(c[d])&&a.each(c[d],function(b){g+=a.render(f,b,!0,e)}),g})),b},insertCSSCode:function(a){var b=document.createElement("style");b.type="text/css",b.media="screen",b.styleSheet?b.styleSheet.cssText=a:b.appendChild(document.createTextNode(a)),document.getElementsByTagName("head")[0].appendChild(b)},css:function(a,b,c){var d,e;return d="undefined"==typeof c?window.getComputedStyle(a,null):a.style,b in d||["Webkit","O","Moz","ms"].forEach(function(a){e=a+b.charAt(0).toUpperCase()+b.substr(1),e in d&&(b=e)}),"undefined"==typeof c?d[b]:d[b]=c},circle:function(a,b){return(b+a%b)%b}};return a}),define("libs/dialog",[],function(){"use strict";function a(a,b){var c,d;for(c=0,d=a.length;d>c;++c)b(a[c],c)}function b(b,c){c=c||{},c.closeOnMask="undefined"==typeof c.closeOnMask?!0:!!c.closeOnMask;var d,e=this;if(d=b.nodeType?b:document.querySelector(b),!d)throw new Error("Dialog("+b+") not exist");var g=d.parentNode;g&&g.classList.contains(f)||(g=document.createElement("div"),g.classList.add(f),g.appendChild(d),j.appendChild(g)),c.closeOnMask&&g.addEventListener("click",function(a){a.target.classList.contains(f)&&e.close()},!1),c.timeout&&setTimeout(function(){e.close()},c.timeout),d.style.display="block",g.style.display="block";var h=window.getComputedStyle(d),i=h.height;d.style.display="none",g.style.display="none",d.style.height=i,a(["left","top","right","bottom"],function(a){d.style[a]="0"}),this.container=d,this.mask=g,this.isOpened=!1}function c(a,c,d,e,f){var g=k.replace("{msg}",a);if("function"!=typeof c){var h=c;c=d,d=h}d=d||{},d.btns=d.btns||f;var i,l="";for(i in d.btns)l+='<a href="" data-key="'+i+'" class="btn btn-'+i+'">'+d.btns[i]+"</a>";g=g.replace("{btns}",l),e.innerHTML=g,e.style.display="none",j.appendChild(e);var m=new b(e,d),n=function(a){var b;if("function"==typeof c){var d=a.target.getAttribute("data-key");b=c("sure"===d?!0:"cancel"===d?!1:d)}b!==!1&&m.close(),a.preventDefault()};for(i in d.btns)e.querySelector(".btn-"+i).addEventListener("click",n);return m.open(),m}function d(a,b,d){var e=document.createElement("div");e.classList.add("dialog"),e.classList.add("dialog-confirm");var f={sure:"确定",cancel:"取消"};return c(a,b,d,e,f)}function e(a,b,d){var e=document.createElement("div");e.classList.add("dialog"),e.classList.add("dialog-alert");var f={sure:"确定"};return c(a,b,d,e,f)}var f="__dialog-mask",g="__dialog-lock",h=document.documentElement,i=0,j=document.body;b.prototype={getContainer:function(){return this.container},open:function(){return this.isOpened||(this.container.style.display="block",this.mask.style.display="block",i++,h.classList.add(g)),this.isOpened=!0,this},close:function(a){return this.isOpened&&(this.container.style.display="none",this.mask.style.display="none",i--,0===i&&h.classList.remove(g),this.mask&&("undefined"==typeof a||a)&&(this.mask.parentNode.removeChild(this.mask),this.container=null,this.mask=null)),this.isOpened=!1,this}};var k='<div class="content"><p class="msg">{msg}</p></div><div class="btns">{btns}</div>';return b.confirm=d,b.alert=e,b.tpl=function(a,c){var d=document.createElement("div");d.className="dialog "+(c?c:""),d.innerHTML=a;var e=new b(d);return e.open()},b}),define("libs/ajax",["libs/utils"],function(a){"use strict";function b(a,b){var c=b.context;return b.beforeSend.call(c,a,b)===!1?!1:void 0}function c(a,b,c){var d=c.context,f="success";c.success.call(d,a,f,b),e(f,b,c)}function d(a,b,c,d){var f=d.context;d.error.call(f,c,b,a),e(b,c,d)}function e(a,b,c){var d=c.context;c.complete.call(d,b,a)}function f(a){return a&&(a=a.split(";",2)[0]),a&&(a===m?"html":a===l?"json":j.test(a)?"script":k.test(a)&&"xml")||"text"}function g(b){if(b.processData&&b.data&&"string"!=typeof b.data){var c,d=[];for(c in b.data)d.push(c+"="+encodeURIComponent(b.data[c]));b.data=d.join("&").replace(/%20/g,"+")}!b.data||b.type&&"GET"!==b.type.toUpperCase()||(b.url=a.appendQuery(b.url,b.data),b.data=void 0)}function h(e){var h=a.extend({},o,e||{});h.url||(h.url=window.location.toString()),h.crossDomain||(h.crossDomain=/^([\w-]+:)?\/\/([^\/]+)/.test(h.url)&&RegExp.$2!==window.location.host),g(h),h.cache===!1&&(h.url=a.appendQuery(h.url,"_="+Date.now()));var j,k=h.dataType,l=h.accepts[k],m={},p=function(a,b){m[a.toLowerCase()]=[a,b]},q=/^([\w-]+:)\/\//.test(h.url)?RegExp.$1:window.location.protocol,r=h.xhr(),s=r.setRequestHeader;h.crossDomain||p("X-Requested-With","XMLHttpRequest"),p("Accept",l||"*/*"),l=h.mimeType,l&&(l.indexOf(",")>-1&&(l=l.split(",",2)[0]),r.overrideMimeType&&r.overrideMimeType(l)),(h.contentType||h.contentType!==!1&&h.data&&"GET"!==h.type.toUpperCase())&&p("Content-Type",h.contentType||"application/x-www-form-urlencoded");var t;if(h.headers)for(t in h.headers)p(t,h.headers[t]);if(r.setRequestHeader=p,r.onreadystatechange=function(){if(4===r.readyState){r.onreadystatechange=i,clearTimeout(j);var a,b=!1;if(r.status>=200&&r.status<300||304===r.status||0===r.status&&"file:"===q){k=k||f(h.mimeType||r.getResponseHeader("content-type")),a=r.responseText;try{"script"===k?(1,eval)(a):"xml"===k?a=r.responseXML:"json"===k&&(a=n.test(a)?null:JSON.parse(a))}catch(e){b=e}b?d(b,"parsererror",r,h):c(a,r,h)}else d(r.statusText||null,r.status?"error":"abort",r,h)}},b(r,h)===!1)return r.abort(),d(null,"abort",r,h),r;var u="async"in h?h.async:!0;r.open(h.type,h.url,u,h.username,h.password);for(t in m)s.apply(r,m[t]);return h.timeout>0&&(j=setTimeout(function(){r.onreadystatechange=i,r.abort(),d(null,"timeout",r,h)},h.timeout)),r.send(h.data?h.data:null),r}var i=function(){},j=/^(?:text|application)\/javascript/i,k=/^(?:text|application)\/xml/i,l="application/json",m="text/html",n=/^\s*$/,o={type:"GET",beforeSend:i,success:i,error:i,complete:i,xhr:function(){return new window.XMLHttpRequest},accepts:{script:"text/javascript, application/javascript, application/x-javascript",json:l,xml:"application/xml, text/xml",html:m,text:"text/plain"},timeout:0,processData:!0,cache:!1};return h}),define("libs/audio-player",[],function(){"use strict";var a=function(){function a(){return f||(f=document.getElementById(h),f||(f=document.createElement("audio"),f.id=h,document.body.appendChild(f),f.addEventListener("ended",b,!1))),f}function b(){f&&f.pause(),g&&(g.classList.remove("stop"),g=null),d&&d.call(null)}function c(c){if(a(),g===c)f.play();else{var d=c.getAttribute("data-src");d&&(c.classList.add("stop"),b(),f.src=d,f.play(),g&&g.classList.remove("stop"))}g=c}var d,e,f,g,h="__player_id__";return document.addEventListener("click",function(a){var d=a.target,f=d.classList;f.contains("audio-control")&&!f.contains("disabled")&&(f.contains("stop")?(b(),f.remove("stop")):(e&&e.call(null),c(d)))},!1),{play:c,stop:b,setVolume:function(b){var c=a();c.volume&&(c.volume=b)},onPlay:function(a){return e=a,this},onEnd:function(a){return d=a,this}}}();return a}),require.config({paths:{zepto:"../bower_components/zepto/zepto",jquery:"../bower_components/jquery/jquery",hammer:"../bower_components/hammerjs/hammer"},shim:{jquery:{exports:"jQuery"},zepto:{exports:"Zepto"}}}),require(["libs/stat","libs/wechat-voice","libs/utils","libs/dialog","libs/agent","libs/ajax","libs/audio-player"],function(a,b,c,d,e,f,g){"use strict";function h(a,b){a.addEventListener("click",function(a){a.preventDefault(),b()})}window.ajax=f,g.setVolume(1);var i="wxfc46fc8cda06764a";if(!e.platform.wechat)return void d.alert("请在微信中浏览");var j=a.local;window.onerror=function(){j.error(arguments,!0)};var k=c._("#record"),l=function(){function a(){var a=h.lastChild;return 3===a.nodeType&&(h.removeChild(a),a=h.lastChild),a}function b(a){e&&a!==e&&(e.isPlaying?e.isPlaying()&&e.stop():e.stop(),e=null)}var e,h=c._(".dialogue"),i={},l=0,m="wx-audio-control";g.onPlay(function(){b(g),e=g}),document.addEventListener("click",function(a){var c=a.target;if(c.classList.contains(m)){var d,f=c.parentNode.parentNode,g=f.id;g&&g in i&&(d=i[g].voice,d.isPlaying()?d.stop():(b(d),d.play(),e=d))}},!1);var n={stopLastVoice:b,addDialogue:function(a,b){var e,f='<div class="avatar"><img src="images/no-hash/avatar_'+a+'.png"><div class="wx-audio-control"></div></div><article class="loading"><i></i><i></i><i></i></article>';e=document.createElement("div"),l+=.5;var g=b.id;e.id=g,e.className=a+" member",e.innerHTML=f,h.appendChild(e),b.on("end",function(){c._("."+m,i[this.id].elem).classList.remove("stop")}),b.on("play",function(){c._("."+m,i[this.id].elem).classList.add("stop")}),b.on("error",function(a,b){d.alert(b.type+b.msg),j.error(arguments),"uploadError"===b.type&&n.removeLastDialogue()}),b.upload(function(a){j.success("上传音频成功 serverId: "+a),n.updateLastDialogue()}),i[g]={elem:e,voice:b}},removeLastDialogue:function(){var b=a(),c=b.id;i[c]&&(i[c].voice.off(),i[c]=null,delete i[c]),h.removeChild(b),b=null,l-=.5},updateLastDialogue:function(){var b=a(),e=b.id;if(i[e]){var g=i[e].elem,h=c._("article",g);f({url:"http://staging-wx.llsapp.com/score?wechat_id=1&media_id="+i[e].voice.serverId,type:"POST",dataType:"json",cache:!1,success:function(a){h.classList.remove("loading");var b=a.score>=80?"good":a.score>=60?"pass":"bad";h.innerHTML='<label class="'+b+'">'+a.score+'</label><p class="result">'+a.score_detail+"</p>",l+=.5,k.innerHTML="点击再试一次",j.success(a)},error:function(){d.alert("分析数据失败"),j.error(arguments[1]),n.removeLastDialogue()}})}},getDialogueCount:function(){return l}};return n}(),m=setTimeout(function(){},1e3);h(k,function(){return l.stopLastVoice(),clearTimeout(m),/\.5$/.test(l.getDialogueCount().toString())?void d.alert("上一次录音结果还在分析中，请稍后"):void b.record({appId:i},{success:function(a){l.addDialogue("master",a)},error:function(a){d.alert("录音失败: "+a.err_msg)}})})}),define("weixin",function(){})}();