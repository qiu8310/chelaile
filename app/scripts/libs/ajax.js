define(['libs/utils'], function(utils) {
  'use strict';
  // XHR version 2
  // 新增加了几个返回的数据类型:   text arraybuffer blob 或 document，默认 text
  // 同时增加了几个发送的数据类型: FormData Blog ArrayBuffer
  // http://www.html5rocks.com/zh/tutorials/file/xhr2/

  var empty = function(){},
      //rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,

      XHR2Types = ['arraybuffer', 'blob', 'document'];

  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context;
    if (settings.beforeSend.call(context, xhr, settings) === false )
      return false;
  }
  function ajaxSuccess(data, xhr, settings) {
    var context = settings.context, status = 'success';
    settings.success.call(context, data, status, xhr);
    ajaxComplete(status, xhr, settings);
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings) {
    var context = settings.context;
    settings.error.call(context, xhr, type, error);
    ajaxComplete(type, xhr, settings);
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context;
    settings.complete.call(context, xhr, status);
  }

  var config = {
    type: 'GET',
    beforeSend: empty,
    success: empty,
    error: empty,
    complete: empty,
    xhr: function () {
      return new window.XMLHttpRequest();
    },

    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: false
  };

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0];
    return mime && ( mime === htmlType ? 'html' :
      mime === jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text';
  }

  // TODO: 支持关联数组的形式，如 foo[aa]=aa&foo[bb]=bb&bar[]=cc&bar[]=dd
  // 目前没实现也可以自己手动实现 flatten
  function serializeData(options) {
    if (options.processData && options.data && (typeof options.data) !== 'string') {
      var k, params = [];
      for (k in options.data) {
        params.push(k + '=' + encodeURIComponent(options.data[k]));
      }
      options.data = params.join('&').replace(/%20/g, '+');
    }

    if (options.data && (!options.type || options.type.toUpperCase() === 'GET')) {
      options.url = utils.appendQuery(options.url, options.data);
      options.data = undefined;
    }

  }


  function ajax(options) {
    var settings = utils.extend({}, config, options || {});
    // 是否是 XHR 2 的返回类型，及发送类型
    var isXHR2ReturnType, isXHR2SendType;

    var dataType = settings.dataType;


    // 默认使用当前 url
    if (!settings.url) settings.url = window.location.toString();

    // 如果跨域了，就不用加上 X-Requested-With 头部，否则请求中会先带有 OPTIONS 请求，再是你指定的 GET/POST..
    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 !== window.location.host;

    // XHR 2 可以直接发送 FormData、Blog、File、ArrayBuffer 等
    if (  settings.data &&
          (typeof settings.data) !== 'string' &&
          utils.toString(settings.data) !== '[object Object]') {
      isXHR2SendType = true;
    } else {
      serializeData(settings);
    }

    // 支持设置 responseType 肯定要支持 indexOf，所以这里不写兼容版的 indexOf
    if (XHR2Types.indexOf && XHR2Types.indexOf(dataType) >= 0) {
      xhr.responseType = dataType;
      isXHR2ReturnType = true;
    }

    if (settings.cache === false) settings.url = utils.appendQuery(settings.url, '_=' + Date.now());

    var mime = settings.accepts[dataType],
        headers = {},
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value]; },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout;

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest');
    setHeader('Accept', mime || '*/*');

    mime = settings.mimeType;
    if (mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0];
      if(xhr.overrideMimeType) xhr.overrideMimeType(mime);
    }

    // XHR 2 不需要设置 Header，如果是上传 File，会自动加上 multipart/form-data
    if (!isXHR2SendType && (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() !== 'GET')))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');

    var name;
    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name]);
    xhr.setRequestHeader = setHeader;

    xhr.onreadystatechange = function(){
      if (xhr.readyState === 4) {
        xhr.onreadystatechange = empty;
        clearTimeout(abortTimeout);
        var result, error = false;
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (xhr.status === 0 && protocol === 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'));

          // 取 xhr 1/2 的返回值
          result = isXHR2ReturnType ? xhr.response : xhr.responseText;

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            switch (dataType) {
              case 'script':  (1,eval)(result); break;
              case 'xml':     result = xhr.responseXML; break;
              case 'json':    result = blankRE.test(result) ? null : JSON.parse(result); break;
              //case 'arraybuffer':  break;
              //case 'blob':         break;
              //case 'document':     break;
            }
          } catch (e) { error = e; }

          if (error) ajaxError(error, 'parsererror', xhr, settings);
          else ajaxSuccess(result, xhr, settings);
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings);
        }
      }
    };

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort();
      ajaxError(null, 'abort', xhr, settings);
      return xhr;
    }


    var async = 'async' in settings ? settings.async : true;
    xhr.open(settings.type, settings.url, async, settings.username, settings.password);

    for (name in headers) nativeSetHeader.apply(xhr, headers[name]);

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty;
        xhr.abort();
        ajaxError(null, 'timeout', xhr, settings);
      }, settings.timeout);
    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null);
    return xhr;
  }

  return ajax;

});
