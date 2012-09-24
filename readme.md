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

	browser : hash with browser information, eg:
	       Firefox 11 => { Firefox:11, Gecko:20100101, Mozilla:5 }
	      Chromium 18 => { Chrome:18, Safari:535.19, Mozilla:5 }
	             IE 9 => { IE:9, Mozilla:5 }
	             IE 8 => { IE:8, Mozilla:4 }
	             IE 7 => { IE:7, Mozilla:4 }
	          Opera 9 => { Opera: 9.8, Presto: 2.1, Version: 11.61 }
	         Safari 5 => { Version:5.1, Safari:534.52, Mozilla:5 }