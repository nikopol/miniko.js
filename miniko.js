/*
miniko.js 0.3
=============
minimalist basic js lib for "modern" browsers
nikomomo@gmail.com 2012  

**selectors**

if content is provided, all matching element will have it.

  _(element,[content])    : return the element provided
  _("#id",[content])      : return the element by id
  _(".class",[content])   : return an elements array matching a classname
  _("selector",[content]) : return an elements array matching a selector

**manipulation**

  append(sel,html)        : append html to matching element(s)

**style**  

  css(sel,'class')        : set classname to matching element(s)
  css(sel,'+class')       : add class to matching element(s)
  css(sel,'-class')       : remove class to matching element(s)
  css(sel,'*class')       : toggle class to matching element(s)
  
**geometry**

  position(element)
  position("#id")         : return {left,right,top,bottom,width,height}

**ajax**
  
  ajax(url,ok)            : perform a GET ajax call
  ajax({                  : perform an ajax call
     url: '?'           
     type: 'GET|DELETE|POST|PUT'
     data: {...},
     ok: function(data,xhr){},
     error: function(responsetext,xhr){},
     datatype: 'application/json',
     contenttype: 'application/x-www-form-urlencoded',
     timeout: 30,
     headers: {
      'key': value
     }
  })
  
**events**

  ready(callback) : callback when the dom is ready
  
**misc**

  browser  : hash with browser information, eg:
	           Firefox 11 => { Firefox:11, Gecko:20100101, Mozilla:5 }
	          Chromium 18 => { Chrome:18, Safari:535.19, Mozilla:5 }
	                 IE 9 => { IE:9, Mozilla:5 }
	                 IE 8 => { IE:8, Mozilla:4 }
	                 IE 7 => { IE:7, Mozilla:4 }
	              Opera 9 => { Opera: 9.8, Presto: 2.1, Version: 11.61 }
	             Safari 5 => { Version:5.1, Safari:534.52, Mozilla:5 }
*/

"use strict";

var

__ = function(o){ return o instanceof Array ? o : [o]; },

_ = function(s,h){
	var o,l,n;
	if(typeof(s)=='object') o = s;
	else if(s.length) {
		if(s[0]=='#')       o = document.getElementById(s.substr(1));
		else {
			if(s[0]=='.')   l = document.getElementsByClassName(s.substr(1));
			else            l = document.querySelectorAll(s);
			for(o=[],n=0; n<l.length; ++n) o.push(l[n]);
		}
	}
	if(o && h!=undefined) __(o).forEach(function(e){ e.innerHTML = h });
	return o;
},

append = function(s,h){
	var o = _(s);
	if(o)
		__(o).forEach(function(e){
			var c = document.createElement('div');
			c.innerHTML = h;
			while(c.childNodes.length) e.appendChild(c.childNodes[0]);
		});
	return o;
},

css = function(s,c){
	var o = _(s),z,l;
	if(!o) return;
	if(c==undefined) return o instanceof Array ? o : o.className;
	if(/^([\+\-\*])(.+)$/.test(c)) {
		z = RegExp.$1;
		c = RegExp.$2;
		__(o).forEach(function(e){
			l = e.className.split(/\s+/).filter(function(n){return n});
			if(z!='-' && l.indexOf(c)==-1) l.push(c);  //add class
			else if(z!='+') l=l.filter(function(n){return n!=c}); //remove class
			o.className = l.join(' ');
		});
	} else
		__(o).forEach(function(e){ e.className = c });
	return o;
},

ajax = function(o,fn){
	if(typeof(o)=='string') o = { url:o, ok:fn };
	var
		type = o.type || 'GET',
		url  = o.url || '',
		ctyp = o.contenttype || 'application/x-www-form-urlencoded',
		dtyp = o.datatype || 'application/json',
		xhr  = new window.XMLHttpRequest(),
		timer,
		d;
	if(o.data){
		if(typeof(o.data)=='string') d = o.data;
		else if(/json/.test(ctyp))   d = JSON.stringify(o.data);
		else {
			d = [];
			for(var n in o.data)
				d.push(encodeURIComponent(n)+'='+encodeURIComponent(o.data[n]));
			d = d.join('&');
		}
		if(/GET|DEL/i.test(type)) {
			url += /\?/.test(url) ? '&'+d : '?'+d;
			d = '';
		}
	}
	if(!o.error) o.error=function(t,xhr){ console.error(t,xhr) };
	if(!o.ok)    o.ok=function(){};
	xhr.onreadystatechange = function(){
		if(xhr.readyState==4) {
			if(timer) clearTimeout(timer);
			if(xhr.status>=200) {
				d=xhr.responseText;
				if(/json/.test(dtyp)) {
					try { d = JSON.parse(xhr.responseText) }
					catch(e) { return o.error('json parse error: '+e.message,xhr) }
				}
				o.ok(d,xhr);
			} else
				o.error(xhr.responseText,xhr);
		}
	};
	xhr.open(type, url, true);
	xhr.setRequestHeader('Content-Type', ctyp);
	if(o.headers) for(var n in o.headers) xhr.setRequestHeader(n, o.headers[n]);
	if(o.timeout) timer = setTimeout(function(){
		xhr.onreadystatechange = function(){};
		xhr.abort();
		if(o.error) o.error('timeout',xhr);
	}, o.timeout*1000);
	xhr.send(d);
	return xhr;
},

position = function(e){
	var	o = _(e), p = {};
	if(o) {
		p = o.getBoundingClientRect();
		p.left += window.pageXOffset;
		p.top += window.pageYOffset;
	}
	return p;
},

ready = function(cb){
	if(/complete|loaded|interactive/.test(document.readyState)) cb();
	else if(document.attachEvent) document.attachEvent('ondocumentready',cb()); 
	else document.addEventListener('DOMContentLoaded',function(){cb()}, false);
},

browser = function(){
	var b = {}, z = navigator.userAgent;
	if(/MSIE\s([\d\.]+)/.test(z)) b.IE = parseFloat(RegExp.$1);
	z.replace(/\s\(.+\)/g,'').split(' ').forEach(function(n){ if(/^(.+)\/(.+)$/.test(n)) b[RegExp.$1] = parseFloat(RegExp.$2) });
	return b;
}();
