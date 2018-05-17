!function(a,b){"function"==typeof define&&define.amd?define("cometd",[],function(){return a["window.org.cometd"]=b()}):"object"==typeof module&&module.exports?module.exports=b():a.cometd=b()}(this,function(){var a=a||{};a.cometd=a.cometd||{};var b=void 0;return function(a,c){"object"==typeof exports?module.exports=c():"function"==typeof b&&b.amd?b([],c):(a.org=a.org||{},a.org.cometd=c())}(this,function(){var a={isString:function(a){return void 0!==a&&null!==a&&("string"==typeof a||a instanceof String)},isArray:function(a){return void 0!==a&&null!==a&&a instanceof Array},inArray:function(a,b){for(var c=0;c<b.length;++c)if(a===b[c])return c;return-1},setTimeout:function(a,b,c){return window.setTimeout(function(){try{a._debug("Invoking timed function",b),b()}catch(c){a._debug("Exception invoking timed function",b,c)}},c)},clearTimeout:function(a){window.clearTimeout(a)}},b=function(){var a=[],b={};this.getTransportTypes=function(){return a.slice(0)},this.findTransportTypes=function(c,d,e){for(var f=[],g=0;g<a.length;++g){var h=a[g];b[h].accept(c,d,e)===!0&&f.push(h)}return f},this.negotiateTransport=function(c,d,e,f){for(var g=0;g<a.length;++g)for(var h=a[g],i=0;i<c.length;++i)if(h===c[i]){var j=b[h];if(j.accept(d,e,f)===!0)return j}return null},this.add=function(c,d,e){for(var f=!1,g=0;g<a.length;++g)if(a[g]===c){f=!0;break}return f||("number"!=typeof e?a.push(c):a.splice(e,0,c),b[c]=d),!f},this.find=function(c){for(var d=0;d<a.length;++d)if(a[d]===c)return b[c];return null},this.remove=function(c){for(var d=0;d<a.length;++d)if(a[d]===c){a.splice(d,1);var e=b[c];return delete b[c],e}return null},this.clear=function(){a=[],b={}},this.reset=function(c){for(var d=0;d<a.length;++d)b[a[d]].reset(c)}},c=function(){var b,c,d;this.registered=function(a,d){b=a,c=d},this.unregistered=function(){b=null,c=null},this._debug=function(){c._debug.apply(c,arguments)},this._mixin=function(){return c._mixin.apply(c,arguments)},this.getConfiguration=function(){return c.getConfiguration()},this.getAdvice=function(){return c.getAdvice()},this.setTimeout=function(b,d){return a.setTimeout(c,b,d)},this.clearTimeout=function(b){a.clearTimeout(b)},this.convertToMessages=function(b){if(a.isString(b))try{return JSON.parse(b)}catch(c){throw this._debug("Could not convert to JSON the following string",'"'+b+'"'),new Error(c)}if(a.isArray(b))return b;if(void 0===b||null===b)return[];if(b instanceof Object)return[b];throw new Error("Conversion Error "+b+", typeof "+typeof b)},this.accept=function(a,b,c){throw new Error("Abstract")},this.getType=function(){return b},this.getURL=function(){return d},this.setURL=function(a){d=a},this.send=function(a,b){throw new Error("Abstract")},this.reset=function(a){this._debug("Transport",b,"reset",a?"initial":"retry")},this.abort=function(){this._debug("Transport",b,"aborted")},this.toString=function(){return this.getType()}};c.derive=function(a){function b(){}return b.prototype=a,new b};var d=function(){function b(a){for(;n.length>0;){var b=n[0],c=b[0],d=b[1];if(c.url!==a.url||c.sync!==a.sync)break;n.shift(),a.messages=a.messages.concat(c.messages),this._debug("Coalesced",c.messages.length,"messages from request",d.id)}}function d(a,b){if(this.transportSend(a,b),b.expired=!1,!a.sync){var c=this.getConfiguration().maxNetworkDelay,d=c;b.metaConnect===!0&&(d+=this.getAdvice().timeout),this._debug("Transport",this.getType(),"waiting at most",d,"ms for the response, maxNetworkDelay",c);var e=this;b.timeout=this.setTimeout(function(){b.expired=!0;var c="Request "+b.id+" of transport "+e.getType()+" exceeded "+d+" ms max network delay",f={reason:c},g=b.xhr;f.httpCode=e.xhrStatus(g),e.abortXHR(g),e._debug(c),e.complete(b,!1,b.metaConnect),a.onFailure(g,a.messages,f)},d)}}function e(a){var b=++k,c={id:b,metaConnect:!1,envelope:a};m.length<this.getConfiguration().maxConnections-1?(m.push(c),d.call(this,a,c)):(this._debug("Transport",this.getType(),"queueing request",b,"envelope",a),n.push([a,c]))}function f(a){var b=a.id;if(this._debug("Transport",this.getType(),"metaConnect complete, request",b),null!==l&&l.id!==b)throw new Error("Longpoll request mismatch, completing request "+b);l=null}function g(c,d){var f=a.inArray(c,m);if(f>=0&&m.splice(f,1),n.length>0){var g=n.shift(),h=g[0],i=g[1];if(this._debug("Transport dequeued request",i.id),d)this.getConfiguration().autoBatch&&b.call(this,h),e.call(this,h),this._debug("Transport completed request",c.id,h);else{var j=this;this.setTimeout(function(){j.complete(i,!1,i.metaConnect);var a={reason:"Previous request failed"},b=i.xhr;a.httpCode=j.xhrStatus(b),h.onFailure(b,h.messages,a)},0)}}}function h(a){if(null!==l)throw new Error("Concurrent metaConnect requests not allowed, request id="+l.id+" not yet completed");var b=++k;this._debug("Transport",this.getType(),"metaConnect send, request",b,"envelope",a);var c={id:b,metaConnect:!0,envelope:a};d.call(this,a,c),l=c}var i=new c,j=c.derive(i),k=0,l=null,m=[],n=[];return j.complete=function(a,b,c){c?f.call(this,a):g.call(this,a,b)},j.transportSend=function(a,b){throw new Error("Abstract")},j.transportSuccess=function(a,b,c){b.expired||(this.clearTimeout(b.timeout),this.complete(b,!0,b.metaConnect),c&&c.length>0?a.onSuccess(c):a.onFailure(b.xhr,a.messages,{httpCode:204}))},j.transportFailure=function(a,b,c){b.expired||(this.clearTimeout(b.timeout),this.complete(b,!1,b.metaConnect),a.onFailure(b.xhr,a.messages,c))},j.send=function(a,b){b?h.call(this,a):e.call(this,a)},j.abort=function(){i.abort();for(var a=0;a<m.length;++a){var b=m[a];b&&(this._debug("Aborting request",b),this.abortXHR(b.xhr)||this.transportFailure(b.envelope,b,{reason:"abort"}))}var c=l;c&&(this._debug("Aborting metaConnect request",c),this.abortXHR(c.xhr)||this.transportFailure(c.envelope,c,{reason:"abort"})),this.reset(!0)},j.reset=function(a){i.reset(a),l=null,m=[],n=[]},j.abortXHR=function(a){if(a)try{var b=a.readyState;return a.abort(),b!==window.XMLHttpRequest.UNSENT}catch(c){this._debug(c)}return!1},j.xhrStatus=function(a){if(a)try{return a.status}catch(b){this._debug(b)}return-1},j},e=function(){var a=new d,b=c.derive(a),e=!0;return b.accept=function(a,b,c){return e||!b},b.newXMLHttpRequest=function(){return new window.XMLHttpRequest},b.xhrSend=function(a){var c=b.newXMLHttpRequest();c.context=b.context,c.withCredentials=!0,c.open("POST",a.url,a.sync!==!0);var d=a.headers;if(d)for(var e in d)d.hasOwnProperty(e)&&c.setRequestHeader(e,d[e]);return c.setRequestHeader("Content-Type","application/json;charset=UTF-8"),c.onload=function(){200===c.status?a.onSuccess(c.responseText):a.onError(c.statusText)},c.onerror=function(){a.onError(c.statusText)},c.send(a.body),c},b.transportSend=function(a,b){this._debug("Transport",this.getType(),"sending request",b.id,"envelope",a);var c=this;try{var d=!0;b.xhr=this.xhrSend({transport:this,url:a.url,sync:a.sync,headers:this.getConfiguration().requestHeaders,body:JSON.stringify(a.messages),onSuccess:function(d){c._debug("Transport",c.getType(),"received response",d);var f=!1;try{var g=c.convertToMessages(d);0===g.length?(e=!1,c.transportFailure(a,b,{httpCode:204})):(f=!0,c.transportSuccess(a,b,g))}catch(h){if(c._debug(h),!f){e=!1;var i={exception:h};i.httpCode=c.xhrStatus(b.xhr),c.transportFailure(a,b,i)}}},onError:function(f,g){c._debug("Transport",c.getType(),"received error",f,g),e=!1;var h={reason:f,exception:g};h.httpCode=c.xhrStatus(b.xhr),d?c.setTimeout(function(){c.transportFailure(a,b,h)},0):c.transportFailure(a,b,h)}}),d=!1}catch(f){e=!1,this.setTimeout(function(){c.transportFailure(a,b,{exception:f})},0)}},b.reset=function(b){a.reset(b),e=!0},b},f=function(){function a(a,b,c){var d=this;return function(){d.transportFailure(a,b,"error",c)}}var b=new d,e=c.derive(b),f=0;return e.accept=function(a,b,c){return!0},e.jsonpSend=function(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script"),d="_cometd_jsonp_"+f++;window[d]=function(e){b.removeChild(c),delete window[d],a.onSuccess(e)};var e=a.url;e+=e.indexOf("?")<0?"?":"&",e+="jsonp="+d,e+="&message="+encodeURIComponent(a.body),c.src=e,c.async=a.sync!==!0,c.type="application/javascript",c.onerror=function(b){a.onError("jsonp "+b.type)},b.appendChild(c)},e.transportSend=function(b,c){for(var d=this,e=0,f=b.messages.length,g=[];f>0;){var h=JSON.stringify(b.messages.slice(e,e+f)),i=b.url.length+encodeURI(h).length,j=this.getConfiguration().maxURILength;if(i>j){if(1===f){var k="Bayeux message too big ("+i+" bytes, max is "+j+") for transport "+this.getType();return void this.setTimeout(a.call(this,b,c,k),0)}--f}else g.push(f),e+=f,f=b.messages.length-e}var l=b;if(g.length>1){var m=0,n=g[0];this._debug("Transport",this.getType(),"split",b.messages.length,"messages into",g.join(" + ")),l=this._mixin(!1,{},b),l.messages=b.messages.slice(m,n),l.onSuccess=b.onSuccess,l.onFailure=b.onFailure;for(var o=1;o<g.length;++o){var p=this._mixin(!1,{},b);m=n,n+=g[o],p.messages=b.messages.slice(m,n),p.onSuccess=b.onSuccess,p.onFailure=b.onFailure,this.send(p,c.metaConnect)}}this._debug("Transport",this.getType(),"sending request",c.id,"envelope",l);try{var q=!0;this.jsonpSend({transport:this,url:l.url,sync:l.sync,headers:this.getConfiguration().requestHeaders,body:JSON.stringify(l.messages),onSuccess:function(a){var b=!1;try{var e=d.convertToMessages(a);0===e.length?d.transportFailure(l,c,{httpCode:204}):(b=!0,d.transportSuccess(l,c,e))}catch(f){d._debug(f),b||d.transportFailure(l,c,{exception:f})}},onError:function(a,b){var e={reason:a,exception:b};q?d.setTimeout(function(){d.transportFailure(l,c,e)},0):d.transportFailure(l,c,e)}}),q=!1}catch(r){this.setTimeout(function(){d.transportFailure(l,c,{exception:r})},0)}},e},g=function(){function b(a,b){a&&(this.webSocketClose(a,b.code,b.reason),this.onClose(a,b))}function d(a){return a===p||a===o}function e(a,b,c){for(var d=[],e=0;e<b.messages.length;++e){var f=b.messages[e];f.id&&d.push(f.id)}a.envelopes[d.join(",")]=[b,c],this._debug("Transport",this.getType(),"stored envelope, envelopes",a.envelopes)}function f(a){if(!p){var c=i.getURL().replace(/^http/,"ws");this._debug("Transport",this.getType(),"connecting to URL",c);try{var e=i.getConfiguration().protocol;a.webSocket=e?new window.WebSocket(c,e):new window.WebSocket(c),p=a}catch(f){throw l=!1,this._debug("Exception while creating WebSocket object",f),new Error(f)}n=i.getConfiguration().stickyReconnect!==!1;var g=this,h=i.getConfiguration().connectTimeout;h>0&&(a.connectTimer=this.setTimeout(function(){i._debug("Transport",g.getType(),"timed out while connecting to URL",c,":",h,"ms"),b.call(g,a,{code:1e3,reason:"Connect Timeout"})},h));var j=function(){i._debug("WebSocket onopen",a),a.connectTimer&&g.clearTimeout(a.connectTimer),d(a)?(p=null,o=a,m=!0,g.onOpen(a)):(i._warn("Closing extra WebSocket connection",this,"active connection",o),b.call(g,a,{code:1e3,reason:"Extra Connection"}))},k=function(b){b=b||{code:1e3},i._debug("WebSocket onclose",a,b,"connecting",p,"current",o),a.connectTimer&&g.clearTimeout(a.connectTimer),g.onClose(a,b)},q=function(b){i._debug("WebSocket onmessage",b,a),g.onMessage(a,b)};a.webSocket.onopen=j,a.webSocket.onclose=k,a.webSocket.onerror=function(){k({code:1e3,reason:"Error"})},a.webSocket.onmessage=q,this._debug("Transport",this.getType(),"configured callbacks on",a)}}function g(a,c,d){var e=JSON.stringify(c.messages);a.webSocket.send(e),this._debug("Transport",this.getType(),"sent",c,"metaConnect =",d),this.onStat({tx:e.length});var f=this.getConfiguration().maxNetworkDelay,g=f;d&&(g+=this.getAdvice().timeout,q=!0);for(var h=this,j=[],k=0;k<c.messages.length;++k)!function(){var d=c.messages[k];d.id&&(j.push(d.id),a.timeouts[d.id]=h.setTimeout(function(){i._debug("Transport",h.getType(),"timing out message",d.id,"after",g,"on",a),b.call(h,a,{code:1e3,reason:"Message Timeout"})},g))}();this._debug("Transport",this.getType(),"waiting at most",g,"ms for messages",j,"maxNetworkDelay",f,", timeouts:",a.timeouts)}function h(a,c,d){try{null===a?(a=p||{envelopes:{},timeouts:{}},e.call(this,a,c,d),f.call(this,a)):(e.call(this,a,c,d),g.call(this,a,c,d))}catch(h){var i=this;this.setTimeout(function(){b.call(i,a,{code:1e3,reason:"Exception",exception:h})},0)}}var i,j=new c,k=c.derive(j),l=!0,m=!1,n=!0,o=null,p=null,q=!1,r=null;return k.reset=function(a){j.reset(a),l=!0,a&&(m=!1),n=!0,o=null,p=null,q=!1},k._notifySuccess=function(a,b){a.call(this,b)},k._notifyFailure=function(a,b,c,d){a.call(this,b,c,d)},k.onOpen=function(a){var b=a.envelopes;this._debug("Transport",this.getType(),"opened",a,"pending messages",b);for(var c in b)if(b.hasOwnProperty(c)){var d=b[c],e=d[0],f=d[1];r=e.onSuccess,g.call(this,a,e,f)}},k.onMessage=function(b,c){this._debug("Transport",this.getType(),"received websocket message",c,b),this.onStat({rx:c.data&&c.data.length||0});for(var d=!1,e=this.convertToMessages(c.data),f=[],g=0;g<e.length;++g){var h=e[g];if((/^\/meta\//.test(h.channel)||void 0===h.data)&&h.id){f.push(h.id);var i=b.timeouts[h.id];i&&(this.clearTimeout(i),delete b.timeouts[h.id],this._debug("Transport",this.getType(),"removed timeout for message",h.id,", timeouts",b.timeouts))}"/meta/connect"===h.channel&&(q=!1),"/meta/disconnect"!==h.channel||q||(d=!0)}for(var j=!1,k=b.envelopes,l=0;l<f.length;++l){var m=f[l];for(var n in k)if(k.hasOwnProperty(n)){var o=n.split(","),p=a.inArray(m,o);if(p>=0){j=!0,o.splice(p,1);var s=k[n][0],t=k[n][1];delete k[n],o.length>0&&(k[o.join(",")]=[s,t]);break}}}j&&this._debug("Transport",this.getType(),"removed envelope, envelopes",k),this._notifySuccess(r,e),d&&this.webSocketClose(b,1e3,"Disconnect")},k.onClose=function(a,b){this._debug("Transport",this.getType(),"closed",a,b),d(a)&&(l=n&&m,p=null,o=null);var c=a.timeouts;a.timeouts={};for(var e in c)c.hasOwnProperty(e)&&this.clearTimeout(c[e]);var f=a.envelopes;a.envelopes={};for(var g in f)if(f.hasOwnProperty(g)){var h=f[g][0],i=f[g][1];i&&(q=!1);var j={websocketCode:b.code,reason:b.reason};b.exception&&(j.exception=b.exception),this._notifyFailure(h.onFailure,a,h.messages,j)}},k.registered=function(a,b){j.registered(a,b),i=b},k.accept=function(a,b,c){return this._debug("Transport",this.getType(),"accept, supported:",l),l&&!!window.WebSocket&&i.websocketEnabled!==!1},k.send=function(a,b){this._debug("Transport",this.getType(),"sending",a,"metaConnect =",b),h.call(this,o,a,b)},k.webSocketClose=function(a,b,c){try{a.webSocket&&a.webSocket.close(b,c)}catch(d){this._debug(d)}},k.abort=function(){j.abort(),b.call(this,o,{code:1e3,reason:"Abort"}),this.reset(!0)},k.onStat=function(a){},k},h=function(c){function d(a,b){try{return a[b]}catch(c){return}}function h(b){return a.isString(b)}function i(a){return void 0!==a&&null!==a&&"function"==typeof a}function j(a,b){for(var c="";--b>0&&!(a>=Math.pow(10,b));)c+="0";return c+=a}function k(a,b){if(window.console){var c=window.console[a];if(i(c)){var d=new Date;[].splice.call(b,0,0,j(d.getHours(),2)+":"+j(d.getMinutes(),2)+":"+j(d.getSeconds(),2)+"."+j(d.getMilliseconds(),3)),c.apply(window.console,b)}}}function l(a){return/(^https?:\/\/)?(((\[[^\]]+\])|([^:\/\?#]+))(:(\d+))?)?([^\?#]*)(.*)?/.exec(a)}function m(a){pa._debug("Configuring cometd object with",a),h(a)&&(a={url:a}),a||(a={}),La=pa._mixin(!1,La,a);var b=pa.getURL();if(!b)throw new Error("Missing required configuration parameter 'url' specifying the Bayeux server URL");var c=l(b),d=c[2],e=c[8],f=c[9];if(ra=pa._isCrossDomain(d),La.appendMessageTypeToURL)if(void 0!==f&&f.length>0)pa._info("Appending message type to URI "+e+f+" is not supported, disabling 'appendMessageTypeToURL' configuration"),La.appendMessageTypeToURL=!1;else{var g=e.split("/"),i=g.length-1;e.match(/\/$/)&&(i-=1),g[i].indexOf(".")>=0&&(pa._info("Appending message type to URI "+e+" is not supported, disabling 'appendMessageTypeToURL' configuration"),La.appendMessageTypeToURL=!1)}}function n(a){if(a){var b=Aa[a.channel];b&&b[a.id]&&(delete b[a.id],pa._debug("Removed",a.listener?"listener":"subscription",a))}}function o(a){a&&!a.listener&&n(a)}function p(){for(var a in Aa)if(Aa.hasOwnProperty(a)){var b=Aa[a];if(b)for(var c in b)b.hasOwnProperty(c)&&o(b[c])}}function q(a){ta!==a&&(pa._debug("Status",ta,"->",a),ta=a)}function r(){return"disconnecting"===ta||"disconnected"===ta}function s(){var a=++ua;return""+a}function t(a,b,c,d,e){try{return b.call(a,d)}catch(f){var g=pa.onExtensionException;if(i(g)){pa._debug("Invoking extension exception handler",c,f);try{g.call(pa,f,c,e,d)}catch(h){pa._info("Exception during execution of extension exception handler",c,h)}}else pa._info("Exception during execution of extension",c,f);return d}}function u(a){for(var b=0;b<Da.length&&(void 0!==a&&null!==a);++b){var c=Da[b],d=c.extension.incoming;if(i(d)){var e=t(c.extension,d,c.name,a,!1);a=void 0===e?a:e}}return a}function v(a){for(var b=Da.length-1;b>=0&&(void 0!==a&&null!==a);--b){var c=Da[b],d=c.extension.outgoing;if(i(d)){var e=t(c.extension,d,c.name,a,!0);a=void 0===e?a:e}}return a}function w(a,b){var c=Aa[a];if(c)for(var d in c)if(c.hasOwnProperty(d)){var e=c[d];if(e)try{e.callback.call(e.scope,b)}catch(f){var g=pa.onListenerException;if(i(g)){pa._debug("Invoking listener exception handler",e,f);try{g.call(pa,f,e,e.listener,b)}catch(h){pa._info("Exception during execution of listener exception handler",e,h)}}else pa._info("Exception during execution of listener",e,b,f)}}}function x(a,b){w(a,b);for(var c=a.split("/"),d=c.length-1,e=d;e>0;--e){var f=c.slice(0,e).join("/")+"/*";e===d&&w(f,b),f+="*",w(f,b)}}function y(){null!==Ca&&a.clearTimeout(Ca),Ca=null}function z(b,c){y();var d=Ea.interval+c;pa._debug("Function scheduled in",d,"ms, interval =",Ea.interval,"backoff =",Ba,b),Ca=a.setTimeout(pa,b,d)}function A(a,b,c,d){for(var e=0;e<b.length;++e){var f=b[e],g=f.id;va&&(f.clientId=va),f=v(f),void 0!==f&&null!==f?(f.id=g,b[e]=f):(delete Fa[g],b.splice(e--,1))}if(0!==b.length){var h=pa.getURL();La.appendMessageTypeToURL&&(h.match(/\/$/)||(h+="/"),d&&(h+=d));var i={url:h,sync:a,messages:b,onSuccess:function(a){try{Ma.call(pa,a)}catch(b){pa._info("Exception during handling of messages",b)}},onFailure:function(a,b,c){try{var d=pa.getTransport();c.connectionType=d?d.getType():"unknown",Na.call(pa,a,b,c)}catch(e){pa._info("Exception during handling of failure",e)}}};pa._debug("Send",i),ma.send(i,c)}}function B(a){wa>0||ya===!0?xa.push(a):A(!1,[a],!1)}function C(){Ba=0}function D(){return Ba<La.maxBackoff&&(Ba+=La.backoffIncrement),Ba}function E(){++wa,pa._debug("Starting batch, depth",wa)}function F(){var a=xa;xa=[],a.length>0&&A(!1,a,!1)}function G(){if(--wa,pa._debug("Ending batch, depth",wa),wa<0)throw new Error("Calls to startBatch() and endBatch() are not paired");0!==wa||r()||ya||F()}function H(){if(!r()){var a={id:s(),channel:"/meta/connect",connectionType:ma.getType()};Ia||(a.advice={timeout:0}),q("connecting"),pa._debug("Connect sent",a),A(!1,[a],!0,"connect"),q("connected")}}function I(a){q("connecting"),z(function(){H()},a)}function J(a){a&&(Ea=pa._mixin(!1,{},La.advice,a),pa._debug("New advice",Ea))}function K(a){if(y(),a&&ma&&ma.abort(),va=null,q("disconnected"),wa=0,C(),ma=null,Ha=!1,Ia=!1,xa.length>0){var b=xa;xa=[],Na.call(pa,void 0,b,{reason:"Disconnected"})}}function L(a,b,c){var d=pa.onTransportException;if(i(d)){pa._debug("Invoking transport exception handler",a,b,c);try{d.call(pa,c,a,b)}catch(e){pa._info("Exception during execution of transport exception handler",e)}}}function M(a,b){i(a)&&(b=a,a=void 0),va=null,p(),r()&&sa.reset(!0),J({}),wa=0,ya=!0,na=a,oa=b;var c="1.0",d=pa.getURL(),e=sa.findTransportTypes(c,ra,d),f={id:s(),version:c,minimumVersion:c,channel:"/meta/handshake",supportedConnectionTypes:e,advice:{timeout:Ea.timeout,interval:Ea.interval}},g=pa._mixin(!1,{},na,f);if(pa._putCallback(g.id,b),!ma&&(ma=sa.negotiateTransport(e,c,ra,d),!ma)){var h="Could not find initial transport among: "+sa.getTransportTypes();throw pa._warn(h),new Error(h)}pa._debug("Initial transport is",ma.getType()),q("handshaking"),pa._debug("Handshake sent",g),A(!1,[g],!1,"handshake")}function N(a){q("handshaking"),ya=!0,z(function(){M(na,oa)},a)}function O(a,b){try{a.call(pa,b)}catch(c){var d=pa.onCallbackException;if(i(d)){pa._debug("Invoking callback exception handler",c);try{d.call(pa,c,b)}catch(e){pa._info("Exception during execution of callback exception handler",e)}}else pa._info("Exception during execution of message callback",c)}}function P(a){var b=pa._getCallback([a.id]);i(b)&&(delete Fa[a.id],O(b,a))}function Q(b){var c=Ga[b.id];if(delete Ga[b.id],c){pa._debug("Handling remote call response for",b,"with context",c);var d=c.timeout;d&&a.clearTimeout(d);var e=c.callback;if(i(e))return O(e,b),!0}return!1}function R(a){pa._debug("Transport failure handling",a),a.transport&&(ma=a.transport),a.url&&ma.setURL(a.url);var b=a.action,c=a.delay||0;switch(b){case"handshake":N(c);break;case"retry":I(c);break;case"none":K(!0);break;default:throw new Error("Unknown action "+b)}}function S(a,b){P(a),x("/meta/handshake",a),x("/meta/unsuccessful",a),r()&&(b.action="none"),pa.onTransportFailure.call(pa,a,b,R)}function T(a){var b=pa.getURL();if(a.successful){var c=pa._isCrossDomain(l(b)[2]),d=sa.negotiateTransport(a.supportedConnectionTypes,a.version,c,b);if(null===d)return a.successful=!1,void S(a,{cause:"negotiation",action:"none",transport:null});ma!==d&&(pa._debug("Transport",ma.getType(),"->",d.getType()),ma=d),va=a.clientId,ya=!1,F(),a.reestablish=Ha,Ha=!0,P(a),x("/meta/handshake",a),Ka=a["x-messages"]||0;var e=r()?"none":Ea.reconnect||"retry";switch(e){case"retry":C(),0===Ka?I(0):pa._debug("Processing",Ka,"handshake-delivered messages");break;case"none":K(!0);break;default:throw new Error("Unrecognized advice action "+e)}}else S(a,{cause:"unsuccessful",action:Ea.reconnect||"handshake",transport:ma})}function U(a){S(a,{cause:"failure",action:"handshake",transport:null})}function V(a,b){x("/meta/connect",a),x("/meta/unsuccessful",a),r()&&(b.action="none"),pa.onTransportFailure.call(pa,a,b,R)}function W(a){if(Ia=a.successful){x("/meta/connect",a);var b=r()?"none":Ea.reconnect||"retry";switch(b){case"retry":C(),I(Ba);break;case"none":K(!1);break;default:throw new Error("Unrecognized advice action "+b)}}else V(a,{cause:"unsuccessful",action:Ea.reconnect||"retry",transport:ma})}function X(a){Ia=!1,V(a,{cause:"failure",action:"retry",transport:null})}function Y(a){K(!0),P(a),x("/meta/disconnect",a),x("/meta/unsuccessful",a)}function Z(a){a.successful?(K(!1),P(a),x("/meta/disconnect",a)):Y(a)}function $(a){Y(a)}function _(a){var b=Aa[a.subscription];if(b)for(var c in b)if(b.hasOwnProperty(c)){var d=b[c];d&&!d.listener&&(delete b[c],pa._debug("Removed failed subscription",d))}P(a),x("/meta/subscribe",a),x("/meta/unsuccessful",a)}function aa(a){a.successful?(P(a),x("/meta/subscribe",a)):_(a)}function ba(a){_(a)}function ca(a){P(a),x("/meta/unsubscribe",a),x("/meta/unsuccessful",a)}function da(a){a.successful?(P(a),x("/meta/unsubscribe",a)):ca(a)}function ea(a){ca(a)}function fa(a){Q(a)||(P(a),x("/meta/publish",a),x("/meta/unsuccessful",a))}function ga(a){void 0!==a.data?Q(a)||(x(a.channel,a),Ka>0&&(--Ka,0===Ka&&(pa._debug("Processed last handshake-delivered message"),I(0)))):void 0===a.successful?pa._warn("Unknown Bayeux Message",a):a.successful?(P(a),x("/meta/publish",a)):fa(a)}function ha(a){fa(a)}function ia(a){if(Ja=0,a=u(a),void 0!==a&&null!==a){J(a.advice);var b=a.channel;switch(b){case"/meta/handshake":T(a);break;case"/meta/connect":W(a);break;case"/meta/disconnect":Z(a);break;case"/meta/subscribe":aa(a);break;case"/meta/unsubscribe":da(a);break;default:ga(a)}}}function ja(a){var b=Aa[a];if(b)for(var c in b)if(b.hasOwnProperty(c)&&b[c])return!0;return!1}function ka(a,b){var c={scope:a,method:b};if(i(a))c.scope=void 0,c.method=a;else if(h(b)){if(!a)throw new Error("Invalid scope "+a);if(c.method=a[b],!i(c.method))throw new Error("Invalid callback "+b+" for scope "+a)}else if(!i(b))throw new Error("Invalid callback "+b);return c}function la(a,b,c,d){var e=ka(b,c);pa._debug("Adding",d?"listener":"subscription","on",a,"with scope",e.scope,"and callback",e.method);var f=++za,g={id:f,channel:a,scope:e.scope,callback:e.method,listener:d},h=Aa[a];return h||(h={},Aa[a]=h),h[f]=g,pa._debug("Added",d?"listener":"subscription",g),g}var ma,na,oa,pa=this,qa=c||"default",ra=!1,sa=new b,ta="disconnected",ua=0,va=null,wa=0,xa=[],ya=!1,za=0,Aa={},Ba=0,Ca=null,Da=[],Ea={},Fa={},Ga={},Ha=!1,Ia=!1,Ja=0,Ka=0,La={protocol:null,stickyReconnect:!0,connectTimeout:0,maxConnections:2,backoffIncrement:1e3,maxBackoff:6e4,logLevel:"info",maxNetworkDelay:1e4,requestHeaders:{},appendMessageTypeToURL:!0,autoBatch:!1,urls:{},maxURILength:2e3,advice:{timeout:6e4,interval:0,reconnect:void 0,maxInterval:0}};this._mixin=function(a,b,c){for(var e=b||{},f=2;f<arguments.length;++f){var g=arguments[f];if(void 0!==g&&null!==g)for(var h in g)if(g.hasOwnProperty(h)){var i=d(g,h),j=d(e,h);if(i===b)continue;if(void 0===i)continue;if(a&&"object"==typeof i&&null!==i)if(i instanceof Array)e[h]=this._mixin(a,j instanceof Array?j:[],i);else{var k="object"!=typeof j||j instanceof Array?{}:j;e[h]=this._mixin(a,k,i)}else e[h]=i}}return e},this._warn=function(){k("warn",arguments)},this._info=function(){"warn"!==La.logLevel&&k("info",arguments)},this._debug=function(){"debug"===La.logLevel&&k("debug",arguments)},this._isCrossDomain=function(a){return!!(window.location&&window.location.host&&a)&&a!==window.location.host};var Ma,Na;this.send=B,this._getCallback=function(a){return Fa[a]},this._putCallback=function(a,b){var c=this._getCallback(a);return i(b)&&(Fa[a]=b),c},this.onTransportFailure=function(a,b,c){this._debug("Transport failure",b,"for",a);var d=this.getTransportRegistry(),e=this.getURL(),f=this._isCrossDomain(l(e)[2]),g="1.0",h=d.findTransportTypes(g,f,e);if("none"===b.action){if("/meta/handshake"===a.channel&&!b.transport){var i="Could not negotiate transport, client=["+h+"], server=["+a.supportedConnectionTypes+"]";this._warn(i),L(ma.getType(),null,{reason:i,connectionType:ma.getType(),transport:ma})}}else if(b.delay=this.getBackoffPeriod(),"/meta/handshake"===a.channel){if(!b.transport){var j=d.negotiateTransport(h,g,f,e);j?(this._debug("Transport",ma.getType(),"->",j.getType()),L(ma.getType(),j.getType(),a.failure),b.action="handshake",b.transport=j):(this._warn("Could not negotiate transport, client=["+h+"]"),L(ma.getType(),null,a.failure),b.action="none")}"none"!==b.action&&this.increaseBackoffPeriod()}else{var k=(new Date).getTime();if(0===Ja&&(Ja=k),"retry"===b.action){b.delay=this.increaseBackoffPeriod();var m=Ea.maxInterval;if(m>0){var n=Ea.timeout+Ea.interval+m,o=k-Ja;o+Ba>n&&(b.action="handshake")}}"handshake"===b.action&&(b.delay=0,d.reset(!1),this.resetBackoffPeriod())}c.call(pa,b)},this.receive=ia,Ma=function(a){pa._debug("Received",a);for(var b=0;b<a.length;++b){var c=a[b];ia(c)}},Na=function(a,b,c){pa._debug("handleFailure",a,b,c),c.transport=a;for(var d=0;d<b.length;++d){var e=b[d],f={id:e.id,successful:!1,channel:e.channel,failure:c};switch(c.message=e,e.channel){case"/meta/handshake":U(f);break;case"/meta/connect":X(f);break;case"/meta/disconnect":$(f);break;case"/meta/subscribe":f.subscription=e.subscription,ba(f);break;case"/meta/unsubscribe":f.subscription=e.subscription,ea(f);break;default:ha(f)}}},this.registerTransport=function(a,b,c){var d=sa.add(a,b,c);return d&&(this._debug("Registered transport",a),i(b.registered)&&b.registered(a,this)),d},this.unregisterTransport=function(a){var b=sa.remove(a);return null!==b&&(this._debug("Unregistered transport",a),i(b.unregistered)&&b.unregistered()),b},this.unregisterTransports=function(){sa.clear()},this.getTransportTypes=function(){return sa.getTransportTypes()},this.findTransport=function(a){return sa.find(a)},this.getTransportRegistry=function(){return sa},this.configure=function(a){m.call(this,a)},this.init=function(a,b){this.configure(a),this.handshake(b)},this.handshake=function(a,b){if("disconnected"!==ta)throw new Error("Illegal state: handshaken");M(a,b)},this.disconnect=function(a,b,c){if(!r()){"boolean"!=typeof a&&(c=b,b=a,a=!1),i(b)&&(c=b,b=void 0);var d={id:s(),channel:"/meta/disconnect"},e=this._mixin(!1,{},b,d);pa._putCallback(e.id,c),q("disconnecting"),A(a===!0,[e],!1,"disconnect")}},this.startBatch=function(){E()},this.endBatch=function(){G()},this.batch=function(a,b){var c=ka(a,b);this.startBatch();try{c.method.call(c.scope),this.endBatch()}catch(d){throw this._info("Exception during execution of batch",d),this.endBatch(),new Error(d)}},this.addListener=function(a,b,c){if(arguments.length<2)throw new Error("Illegal arguments number: required 2, got "+arguments.length);if(!h(a))throw new Error("Illegal argument type: channel must be a string");return la(a,b,c,!0)},this.removeListener=function(a){if(!(a&&a.channel&&"id"in a))throw new Error("Invalid argument: expected subscription, not "+a);n(a)},this.clearListeners=function(){Aa={}},this.subscribe=function(a,b,c,d,e){if(arguments.length<2)throw new Error("Illegal arguments number: required 2, got "+arguments.length);if(!h(a))throw new Error("Illegal argument type: channel must be a string");if(r())throw new Error("Illegal state: disconnected");i(b)&&(e=d,d=c,c=b,b=void 0),i(d)&&(e=d,d=void 0);var f=!ja(a),g=la(a,b,c,!1);if(f){var j={id:s(),channel:"/meta/subscribe",subscription:a},k=this._mixin(!1,{},d,j);pa._putCallback(k.id,e),B(k)}return g},this.unsubscribe=function(a,b,c){if(arguments.length<1)throw new Error("Illegal arguments number: required 1, got "+arguments.length);if(r())throw new Error("Illegal state: disconnected");i(b)&&(c=b,b=void 0),this.removeListener(a);var d=a.channel;if(!ja(d)){var e={id:s(),channel:"/meta/unsubscribe",subscription:d},f=this._mixin(!1,{},b,e);pa._putCallback(f.id,c),B(f)}},this.resubscribe=function(a,b){if(o(a),a)return this.subscribe(a.channel,a.scope,a.callback,b)},this.clearSubscriptions=function(){p()},this.publish=function(a,b,c,d){if(arguments.length<1)throw new Error("Illegal arguments number: required 1, got "+arguments.length);if(!h(a))throw new Error("Illegal argument type: channel must be a string");if(/^\/meta\//.test(a))throw new Error("Illegal argument: cannot publish to meta channels");if(r())throw new Error("Illegal state: disconnected");i(b)?(d=b,b={},c=void 0):i(c)&&(d=c,c=void 0);var e={id:s(),channel:a,data:b},f=this._mixin(!1,{},c,e);pa._putCallback(f.id,d),B(f)},this.publishBinary=function(a,b,c,d,e){i(b)?(e=b,b=new ArrayBuffer(0),c=!0,d=void 0):i(c)?(e=c,c=!0,d=void 0):i(d)&&(e=d,d=void 0);var f={meta:d,data:b,last:c},g={ext:{binary:{}}};this.publish(a,f,g,e)},this.remoteCall=function(b,c,d,e,f){if(arguments.length<1)throw new Error("Illegal arguments number: required 1, got "+arguments.length);if(!h(b))throw new Error("Illegal argument type: target must be a string");if(r())throw new Error("Illegal state: disconnected");if(i(c)?(f=c,c={},d=La.maxNetworkDelay,e=void 0):i(d)?(f=d,d=La.maxNetworkDelay,e=void 0):i(e)&&(f=e,e=void 0),"number"!=typeof d)throw new Error("Illegal argument type: timeout must be a number");b.match(/^\//)||(b="/"+b);var g="/service"+b,j={id:s(),channel:g,data:c},k=this._mixin(!1,{},e,j),l={callback:f};d>0&&(l.timeout=a.setTimeout(pa,function(){pa._debug("Timing out remote call",k,"after",d,"ms"),fa({id:k.id,error:"406::timeout",successful:!1,failure:{message:k,reason:"Remote Call Timeout"}})},d),pa._debug("Scheduled remote call timeout",k,"in",d,"ms")),Ga[k.id]=l,B(k)},this.remoteCallBinary=function(a,b,c,d,e,f){i(b)?(f=b,b=new ArrayBuffer(0),c=!0,d=void 0,e=La.maxNetworkDelay):i(c)?(f=c,c=!0,d=void 0,e=La.maxNetworkDelay):i(d)?(f=d,d=void 0,e=La.maxNetworkDelay):i(e)&&(f=e,e=La.maxNetworkDelay);var g={meta:d,data:b,last:c},h={ext:{binary:{}}};this.remoteCall(a,g,e,h,f)},this.getStatus=function(){return ta},this.isDisconnected=r,this.setBackoffIncrement=function(a){La.backoffIncrement=a},this.getBackoffIncrement=function(){return La.backoffIncrement},this.getBackoffPeriod=function(){return Ba},this.increaseBackoffPeriod=function(){return D()},this.resetBackoffPeriod=function(){C()},this.setLogLevel=function(a){La.logLevel=a},this.registerExtension=function(a,b){
if(arguments.length<2)throw new Error("Illegal arguments number: required 2, got "+arguments.length);if(!h(a))throw new Error("Illegal argument type: extension name must be a string");for(var c=!1,d=0;d<Da.length;++d){var e=Da[d];if(e.name===a){c=!0;break}}return c?(this._info("Could not register extension with name",a,"since another extension with the same name already exists"),!1):(Da.push({name:a,extension:b}),this._debug("Registered extension",a),i(b.registered)&&b.registered(a,this),!0)},this.unregisterExtension=function(a){if(!h(a))throw new Error("Illegal argument type: extension name must be a string");for(var b=!1,c=0;c<Da.length;++c){var d=Da[c];if(d.name===a){Da.splice(c,1),b=!0,this._debug("Unregistered extension",a);var e=d.extension;i(e.unregistered)&&e.unregistered();break}}return b},this.getExtension=function(a){for(var b=0;b<Da.length;++b){var c=Da[b];if(c.name===a)return c.extension}return null},this.getName=function(){return qa},this.getClientId=function(){return va},this.getURL=function(){if(ma){var a=ma.getURL();if(a)return a;if(a=La.urls[ma.getType()])return a}return La.url},this.getTransport=function(){return ma},this.getConfiguration=function(){return this._mixin(!0,{},La)},this.getAdvice=function(){return this._mixin(!0,{},Ea)},window.WebSocket&&this.registerTransport("websocket",new g),this.registerTransport("long-polling",new e),this.registerTransport("callback-polling",new f)},i=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",".","-",":","+","=","^","!","/","*","?","&","<",">","(",")","[","]","{","}","@","%","$","#"],j=[0,68,0,84,83,82,72,0,75,76,70,65,0,63,62,69,0,1,2,3,4,5,6,7,8,9,64,0,73,66,74,71,81,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,77,0,78,67,0,0,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,79,0,80,0,0],k={encode:function(a){var b=null;if(a instanceof ArrayBuffer?b=a:a.buffer instanceof ArrayBuffer?b=a.buffer:Array.isArray(a)&&(b=new Uint8Array(a).buffer),null==b)throw new Error("Cannot Z85 encode "+a);for(var c=b.byteLength,d=c%4,e=4-(0===d?4:d),f=new DataView(b),g="",h=0,j=0;j<c+e;++j){var k=j>=c;if(h=256*h+(k?0:f.getUint8(j)),(j+1)%4===0){for(var l=52200625,m=5;m>0;--m){if(!k||m>e){var n=Math.floor(h/l)%85;g+=i[n]}l/=85}h=0}}return g},decode:function(a){for(var b=a.length%5,c=5-(0===b?5:b),d=0;d<c;++d)a+=i[i.length-1];for(var e=a.length,f=new ArrayBuffer(4*e/5-c),g=new DataView(f),h=0,k=0,l=0,m=0;m<e;++m){var n=a.charCodeAt(k++)-32;if(h=85*h+j[n],k%5===0){for(var o=16777216;o>=1;)l<g.byteLength&&g.setUint8(l++,Math.floor(h/o)%256),o/=256;h=0}}return f}};return{CometD:h,Transport:c,RequestTransport:d,LongPollingTransport:e,CallbackPollingTransport:f,WebSocketTransport:g,Utils:a,Z85:k}}),function(a,c){"object"==typeof exports?module.exports=c(require("./cometd")):"function"==typeof b&&b.amd?b(["./cometd"],c):c(a.org.cometd)}(this,function(a){return a.AckExtension=function(){function a(a,c){b._debug(a,c)}var b,c,d=!1;this.registered=function(c,d){b=d,a("AckExtension: executing registration callback")},this.unregistered=function(){a("AckExtension: executing unregistration callback"),b=null},this.incoming=function(b){var e=b.channel,f=b.ext;if("/meta/handshake"===e){if(f){var g=f.ack;if("object"==typeof g){d=g.enabled===!0;var h=g.batch;"number"==typeof h&&(c=h)}else d=g===!0}a("AckExtension: server supports acknowledgements",d)}else"/meta/connect"===e&&b.successful&&d&&f&&"number"==typeof f.ack&&(c=f.ack,a("AckExtension: server sent batch",c));return b},this.outgoing=function(e){var f=e.channel;return e.ext||(e.ext={}),"/meta/handshake"===f?(e.ext.ack=b&&b.ackEnabled!==!1,d=!1,c=0):"/meta/connect"===f&&d&&(e.ext.ack=c,a("AckExtension: client sending batch",c)),e}}}),function(a,c){"object"==typeof exports?module.exports=c(require("./cometd")):"function"==typeof b&&b.amd?b(["./cometd"],c):c(a.org.cometd)}(this,function(a){return a.TimeSyncExtension=function(b){function c(a,b){d._debug(a,b)}var d,e=b&&b.maxSamples||10,f=[],g=[],h=0,i=0;this.registered=function(a,b){d=b,c("TimeSyncExtension: executing registration callback")},this.unregistered=function(){c("TimeSyncExtension: executing unregistration callback"),d=null,f=[],g=[]},this.incoming=function(a){var b=a.channel;if(b&&0===b.indexOf("/meta/")&&a.ext&&a.ext.timesync){var d=a.ext.timesync;c("TimeSyncExtension: server sent timesync",d);var j=(new Date).getTime(),k=(j-d.tc-d.p)/2,l=d.ts-d.tc-k;f.push(k),g.push(l),g.length>e&&(g.shift(),f.shift());for(var m=g.length,n=0,o=0,p=0;p<m;++p)n+=f[p],o+=g[p];h=parseInt((n/m).toFixed()),i=parseInt((o/m).toFixed()),c("TimeSyncExtension: network lag",h,"ms, time offset with server",i,"ms",h,i)}return a},this.outgoing=function(a){var b=a.channel;return b&&0===b.indexOf("/meta/")&&(a.ext||(a.ext={}),a.ext.timesync={tc:(new Date).getTime(),l:h,o:i},c("TimeSyncExtension: client sending timesync",a.ext.timesync)),a},this.getTimeOffset=function(){return i},this.getTimeOffsetSamples=function(){return g},this.getNetworkLag=function(){return h},this.getServerTime=function(){return(new Date).getTime()+i},this.getServerDate=function(){return new Date(this.getServerTime())},this.setTimeout=function(b,c){var e=c instanceof Date?c.getTime():0+c,f=e-i,g=f-(new Date).getTime();return g<=0&&(g=1),a.Utils.setTimeout(d,b,g)}}}),function(a,c){"object"==typeof exports?module.exports=c(require("./cometd")):"function"==typeof b&&b.amd?b(["./cometd"],c):c(a.org.cometd)}(this,function(a){return a.BinaryExtension=function(){this.incoming=function(b){if(!/^\/meta\//.test(b.channel)){var c=b.ext;if(c){var d=c.binary;d&&(b.data.data=a.Z85.decode(b.data.data))}}return b},this.outgoing=function(b){if(!/^\/meta\//.test(b.channel)){var c=b.ext;if(c){var d=c.binary;d&&(b.data.data=a.Z85.encode(b.data.data))}}return b}}}),window.org.cometd});