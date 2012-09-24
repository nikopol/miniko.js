/*
minimalist basic js lib 0.1
nikomomo@gmail.com

all "id" parameter can be an element.id or directly an DOM element

  _(id,[content])   : return the DOM element by id, 
                      and set its content if provided
  append(id,html)   : append html to id
  css(id,'class')   : set classname
  css(id,'+class')  : add class to classname
  css(id,'-class')  : remove class from classname
  css(id,'*class')  : toggle class in classname
  position(id)      : return {left,right,top,bottom,width,height} of id
  ajax(url,ok)      :  perform a GET ajax call
  ajax({            : perform an ajax call
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
  ready(callback)   : callback when the dom is ready 

=========================================================================
LICENSE
=========================================================================

DO WHAT THE FUCK YOU WANT WITH
ESPECIALLY IF YOU OFFER ME A BEER
PUBLIC LICENSE
Version 1, Mars 2012
 
Copyright (C) 2012 - niko
 
Everyone is permitted to copy and distribute verbatim 
or modified copies of this license document, and 
changing it is allowed as long as the name is changed.

DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND 
MODIFICATION :
- You just DO WHAT THE FUCK YOU WANT.

*/

var

_ = function(e,h){
	var o = typeof(e)=='string' ? window.document.getElementById(e) : e;
	if(o && h!=undefined) o.innerHTML = h;
	return o;
},

append = function(e,h){
	var o = _(e);
	if(o) {
		var z = document.createElement('div');
		z.innerHTML = h;
		while(z.childNodes.length) o.appendChild(z.childNodes[0]);
	}
	return o;
},

css = function(e,c){
	var o = _(e),z,l;
	if(!o) return;
	if(c==undefined) return o.className;
	if(/^([\+\-\*])(.+)$/.test(c)) {
		z = RegExp.$1;
		c = RegExp.$2;
		l = o.className.split(/\s+/).filter(function(n){return n});
		if(z!='-' && l.indexOf(c)==-1) l.push(c);  //add class
		else if(z!='+') l=l.filter(function(n){return n!=c}); //remove class
		o.className = l.join(' ');
	} else
		o.className = c;
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
	xhr.onreadystatechange = function(){
		if(xhr.readyState==4) {
			if(timer) clearTimeout(timer);
			if(xhr.status>=200) {
				if(o.ok) o.ok(/json/.test(dtyp)?JSON.parse(xhr.responseText):xhr.responseText,xhr);
			} else if(o.error)
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
};

