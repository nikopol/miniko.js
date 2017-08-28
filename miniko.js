/*
miniko.js 2.6
=============

minimalist "all-in-one function" javascript swiss knife with a vanilla flavor.

the base of this mini-lib is to return a *true* Array of DOM Elements
```js
_('div').forEach(function(e){
  e.style.backgroundColor = 'red';
});
```
except for the _('#id') selector returning directly the DOM element.
```js
_('#id').style.backgroundColor = 'red';
```


*sample usage*:
```js
var but = _(
  "<button>ok</button>",  //create a button
  {
    css: {color: "red"},  //set button style
    click: function(){    //set button on-click action
      console.log("click!")
    }
  }
);

_('body',        //select body
  {
    append: but, //append the but to body
    css: {       //setup some css to body
      padding: "50px",
      "text-align": "center"
    }
  }
);

//change button text
_('body button','slap me!');
```

### SELECTORS

```js
_(element)           ;// return the DOM Element provided
_("#id")             ;// return the element by id
_("<el>...</el>")    ;// create and return an array of DOM Element(s)
_("tag, .classname") ;// return an elements array matching the selection
```

### DOM

```js
_(sel, content)            ;// set content of selected elements
_(sel, {content: content}) ;// set content of selected elements
_(sel, {append: content})  ;// append content to selected elements
_(sel, {remove: true|fn})  ;// remove selected elements from dom if true
                            // or fn(element) returns true
_(sel, fn)                 ;// call fn for each elements of sel
```

### CSS

```js
_(sel, {css: {style: value}}) ;// set style value's
_(sel, {css: 'class'})        ;// set/overwrite classname to matching element(s)
_(sel, {has: 'class'})        ;// return number of element with class
_(sel, {css: '+C1-C2*C3'})    ;// add C1 to matching element(s) and
                              ;//   remove C2 to matching element(s) and
                              ;//   toggle C3 to matching element(s)
```

### AJAX

```js
_({url: '?'
   type: 'GET'                                       ;default value
   data: {var1:val1},
   ok: function(data,xhr){},                         ;called on success
   error: function(responsetext,xhr){},              ;called on error
   done: function(responsetext,xhr){},               ;called after ok or error
   datatype: 'application/json',                     ;default value
   contenttype: 'application/x-www-form-urlencoded', ;default value
   timeout: 30,                                      ;default value (in seconds)
   headers: {key: value}
})
```

*notes*:
- return a XMLHttpRequest object
- use `{contenttype: 'application/json'}` if you want your data automatically serialized in json.
- default settings are in the object _.ajax and are overridable

### EVENTS

```js
_(fn)                      ;// call fn when the dom is ready
_(sel, {click: fn})        ;// bind event to fn for sel
_(sel, {'-click': fn}})    ;// unbind fn from event for sel
```

### TOOLS

```js
_.isObject(o)              ;// => return true if o={...} only
_.isArray(o)               ;// => return true if o=[...] only
_.isDefined(o)             ;// => return o!==undefined && o!==null
_.forAll(o, fn)            ;// => tranform o in array (if necessary) and apply a forEach(fn)
_.clone(o)                 ;// => deep clone o
_.merge(dst,src)           ;// => deep merge src into dst
_.debounce(fn[, ms])       ;// => debounce 'fn' with 'ms' delay (default delay=200ms)

//example
_(window, {
  resize: _.debounce(function(e){ console.log(e) }, 1000)
})
```

### PLUGIN: MAKE YOUR OWN METHOD


```js
//find children elements matching a selector
_.fn.find = function(sel,val){
  var found = [];
  _.forAll(sel, function(elem){
    if( elem.querySelectorAll )
      found = found.concat(
        [].slice.call(elem.querySelectorAll(val))
      );
  });
  return found;
};

//now you can use it
_('div', {find: "span.active"});
```
*/

(function(W){
  "use strict";

  var D = W.document, rexspaces = /\s+/;

  function nop(){}

  //is a pure object ?
  function iso(o){
    return Object.prototype.toString.call(o) == '[object Object]';
  }

  //is an array ?
  function isa(o){
    return Object.prototype.toString.call(o) == '[object Array]';
  }

  //is defined ?
  function def(o){
    return o!==undefined && o!==null;
  }

  function merge(dst, src){
    if( iso(src) ) {
      if( !iso(dst) ) dst={};
      for( var k in src )
        if( src.hasOwnProperty(k) )
          dst[k]=merge(dst[k], src[k]);
    } else
      dst=src;
    return dst;
  }

  //transform to an array
  function all(sel){
    return !def(sel)
      ? []
      : sel instanceof Array
        ? sel
        : [sel]
    ;
  }

  //iter a function on an array
  function forall(sel, fn){
    all(sel).forEach(fn);
    return sel;
  }

  //deep clone
  function clone(o) {
    var x;
    if( !o || typeof o!=='object' )
      x = o;
    else if( isa(o) ) {
      x = [];
      o.forEach(function(z,n){ x[n] = clone(z) });
    } else {
      x = {};
      for (var k in o)
        if( o.hasOwnProperty(k) )
          x[k] = clone(o[k]);
    }
    return x;
  }

  //callback when dom is ready
  function ready(fn){
    /complete|loaded|interactive/.test(D.readyState)
      ? fn()
      : D.addEventListener('DOMContentLoaded', fn, false)
    ;
  }

  var ajaxdft = {
    type: 'GET',
    url: '',
    data: false,
    headers: {},
    contenttype: 'application/x-www-form-urlencoded',
    datatype: 'application/json',
    error: nop,
    ok: nop,
    done: nop,
    timeout: false
  };

  //performs an ajax call
  function ajax(o, fn){
    var xhr = new window.XMLHttpRequest(),
        wbody, timer, d, n;
    for( n in ajaxdft )
      o[n] = o[n] || ajaxdft[n];
    if( o.data ){
      wbody = /POST|PUT/i.test(o.type);
      if( wbody && typeof(o.data)=='string' )
        //raw body
        d = o.data;
      else if( wbody && o.data.toString()=='[object FormData]' ) {
        d = o.data;
        //o.contenttype = false;
      } else if( wbody && /json/.test(o.contenttype) )
        //serialize body as json
        d = JSON.stringify(o.data);
      else {
        //serialize body as form-urlencoded
        d = [];
        for( n in o.data )
          d.push(encodeURIComponent(n)+'='+encodeURIComponent(o.data[n]));
        d = d.join('&');
      }
      if( !wbody ) {
        //serialize as url arguments
        o.url += o.url.indexOf('?')==-1 ? '?'+d : '&'+d;
        d = '';
      }
    }
    xhr.onreadystatechange = function(){
      if( xhr.readyState==4 ) {
        clearTimeout(timer);
        d = xhr.responseText;
        if( /json/.test(o.datatype) ) {
          try { d = JSON.parse(xhr.responseText) }
          catch(e) { console.log('ajax json parse error: '+e.message, xhr) }
        }
        o.done(o[(xhr.status+'')[0]=='2'?'ok':'error'](d, xhr));
      }
    };
    xhr.open(o.type, o.url, true);
    if( o.contenttype ) o.headers['Content-Type'] = o.contenttype;
    for(n in o.headers)
      xhr.setRequestHeader(n, o.headers[n]);
    if( o.timeout )
      timer = setTimeout(function(){
        xhr.abort();
        o.done(o.error('timeout',xhr));
      }, o.timeout*1000);
    if( o.binary ) {
      var i, len = d.length, e = new Uint8Array(len);
      for (i = 0; i < len; i++)
        e[i] = d.charCodeAt(i) & 0xff;
      d = e;
    }
    xhr.send(d);
    return xhr;
  };

  var $ = {

    content: function(sel, content){
      return forall(sel, typeof(content) == 'string'
        ? function(e){
            e.innerHTML = content;
          }
        : function(e){
            e.innerHTML = '';
            forall(content, function(o){
              e.appendChild(o);
            });
          }
      );
    },

    append: function(el, content){
      if( el instanceof Array ) el = el.shift();
      if( def(el) ){
        if( typeof(content) == 'string' ){
          var z = el.tagName == 'TBODY'
            ? _('<table>', content).children[0].childNodes
            : _('<div>', content).childNodes;
          while( z.length ) el.appendChild(z[0]);
        } else {
          forall(content, function(e){
            el.appendChild(e);
          });
        }
      }
      return el;
    },

    remove: function(sel, fn){
      return forall(sel, typeof(fn)=='function'
        ? function(e){ fn(e) && e.remove() }
        : fn
          ? function(e){ e.remove() }
          : nop
      );
    },

    css: function(sel, cls){
      var m, z, v, q=/([\+\-\*])([^\+\-\*\s]+)/g;
      if( iso(cls) ) {
        //set mode
        forall(sel, function(e){
          for(m in cls) e.style[m] = cls[m];
        });
      } else if( /^[\+\-\*]/.test(cls) ) {
        //add/remove/toggle mode
        while( (m = q.exec(cls)) !== null ) {
          z = m[1];
          v = m[2];
          forall(sel, function(e){
            var w = e.className.split(rexspaces).filter(function(n){ return n });
            if( z!='-' && w.indexOf(v)==-1 ) {
              //add class
              w.push(v);
            } else if( z != '+' ) {
              //remove class
              w = w.filter(function(n){ return n!=v });
            }
            e.className = w.join(' ');
          });
        }
      } else {
        //set mode
        forall(sel, function(e){ e.className = cls });
      }
      return sel;
    },

    has: function(sel, cls){
      var n = 0, c = cls.split(rexspaces);
      forall(sel, function(e){
        n += e.className.split(rexspaces).filter(function(f){
          return c.indexOf(f) != -1;
        }).length;
      });
      return n;
    },

    on: function(sel, events, fn){
      return forall(sel, function(d){
        if( iso(events) )
          for(var e in events)
            d.addEventListener(e, events[e]);
        else
          d.addEventListener(events, fn);
      });
    },

    off: function(sel, events, fn){
      return forall(sel, function(d){
        if( iso(events) )
          for(var e in events)
            d.removeEventListener(e, events[e]);
        else
          d.removeEventListener(events, fn);
      });
    }

  }

  //all in one to rule them all
  function _(sel, ope){
    var o, l, n, ts = typeof(sel);
    if( def(sel) ) {
      if( ts == 'function' ) {
        //first argument is a function -> on ready
        ready(sel);
      } else if( iso(sel) ) {
        //first argument is a pure object -> ajax call
        o = ajax(sel);
      } else {
        //first argument in selector mode
        if( ts == 'string' ) {
          if( /^#[^ ,\.\>\<]*$/.test(sel) ) {
            //selector is an #id
            o = D.getElementById(sel.substr(1));
          } else if( /^<.+>$/.test(sel) ) {
            //selector is html string
            (n = D.createElement('div')).innerHTML = sel;
            l = [].slice.call(n.childNodes);
            o = l.length
              ? ( l.length>1 ? l : l[0] )
              : undefined;
          } else {
            //selector is a query selector
            o = [].slice.call(D.querySelectorAll(sel), 0);
          }
        } else
          //assume selector is a DOM Element
          o = sel;
        if( o && def(ope) ) {
          ts = typeof(ope);
          if( ts=='string' )
            //hack for set content
            ope = {content: ope};
          if( iso(ope) )
            for( n in ope ) {
              if( $[n] )
                o = $[n](o, ope[n]);
              else if( typeof(ope[n])=='function' )
                //hack for -events
                n[0] == '-'
                  ? $.off(o, n.substr(1), ope[n])
                  : $.on(o, n, ope[n]);
            }
          if( ts=='function' )
            forall(o, ope);
        }
      }
    }
    return o;
  }

  _.fn = $;
  _.debounce = function(fn, delay) {
    var timer;
    return function(){
      var self = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function(){
        timer = null;
        fn.apply(self, args);
      }, delay || 200);
    };
  };
  _.isObject = iso;
  _.isArray = isa;
  _.isDefined = def;
  _.forAll = forall;
  _.ajax = ajaxdft;
  _.clone = clone;
  _.merge = merge;
  W._ = _;

})(window);