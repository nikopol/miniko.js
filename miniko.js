/*
miniko.js 0.1
MInimalist basic js lib
NIKOmomo@gmail.com

==============================================================================
LICENSE
==============================================================================
           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                   Version 2, December 2004
 
Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>
 
Everyone is permitted to copy and distribute verbatim or modified
copies of this license document, and changing it is allowed as long
as the name is changed.
 
           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 
 0. You just DO WHAT THE FUCK YOU WANT TO.

==============================================================================
USES
==============================================================================
all "id" parameter can be an element.id or directly an DOM element

  _(id,[content])   : return the DOM element by id, 
                      and set its content if provided
  append(id,html)   : append html to id
  css(id,'class')   : set classname
  css(id,'+class')  : add class to classname
  css(id,'-class')  : remove class from classname
  css(id,'*class')  : toggle class in classname
  position(id)      : return {left,right,top,bottom,width,height} of id
  ajax(url,success) : perform a GET ajax call
  ajax({            : perform an ajax call
     url: '?'           
     type: 'GET|DELETE|POST|PUT'
     data: {...},
     success: function(data){},
     error: function(xhr){},
     datatype: 'application/json',
     contenttype: 'application/x-www-form-urlencoded',
     timeout: 30
  })
  ready(callback)   : callback when the dom is ready 

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
	if(o){
		if(/^([\+\-\*])?(.*)$/.test(c)) {
			z = RegExp.$1;
			c = RegExp.$2;
			l = o.className.split(' ');
			if(z!='-' && l.indexOf(c)==-1) l.push(c);        //add class
			else if(z!='+') l=l.filter(function(n){ n!=c }); //remove class
			o.className = l.join(' ');
		} else
			o.className = c;
	}
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
		data;
	if(o.data){
		if(/GET|DEL/i.test(type)) {
			if(typeof(o.data)!='string'){
				data = [];
				for(var n in o.data) data.push(n+'='+encodeURIComponent(o.data[n]));
				data = data.join('&');
			}
			url += (url.indexOf('?')==-1)
				? '?'+data
				: '&'+data;
			data = '';
		} else if(typeof(o.data)=='string') {
			data = o.data;
		} else {
			ctyp = 'application/json';
			data = JSON.stringify(o.data);
		}
	}
	xhr.onreadystatechange = function(){
		if(xhr.readyState==4) {
			if(timer) clearTimeout(timer);
			if(xhr.status>=200 && xhr.status<300) {
				if(o.ok) o.ok((/json/.test(dtyp)) ? JSON.parse(xhr.responseText) : xhr.responseText);
			} else if(o.error) 
				o.error(xhr);
		}
	};
	xhr.open(type, url, true);
	xhr.setRequestHeader('Content-Type', ctyp);
	if(o.headers) for(var n in o.headers) xhr.setRequestHeader(n, o.headers[n]);
	if(o.timeout) timer = setTimeout(function(){
		xhr.onreadystatechange = function(){};
		xhr.abort();
		if(o.error) o.error(xhr,'timeout');
	}, o.timeout*1000);
	xhr.send(data);
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

_already = false,

ready = function(cb){
	if(_already) cb();
	else document.addEventListener('DOMContentLoaded',function(){cb(_already=true)}, false);
};

