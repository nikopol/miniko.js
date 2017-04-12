/*
miniko.js 2.1
=============

minimalist "all-in-one function" javascript swiss knife with a vanilla flavor.

*sample usage*:
```js
_('body', {append: _("<button>hit me!</button>", {css: {color: "red"},
                                                  click: function(){ console.log("click!") }}),
           css: {padding: "50px",
                 "text-align": "center"}
          }
);

_('body button','slap me!');

```

### SELECTORS

```js
_(element)           ;// return the DOM Element provided
_("#id")             ;// return the element by id
_("<el>...</el>")    ;// create and return an array of DOM Element(s)
_("tag, .classname") ;// return an elements array matching the selection
```

### HTML

```js
_(sel, content)            ;// set content of selected elements
_(sel, {content: content}) ;// set content of selected elements
_(sel, {append: content})  ;// append content to selected elements
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
   ok: function(data,xhr){},
   error: function(responsetext,xhr){},
   datatype: 'application/json',                     ;default value
   contenttype: 'application/x-www-form-urlencoded', ;default value
   timeout: 30,                                      ;default value
   headers: {key: value}
})
```

*notes*:
- return a XMLHttpRequest object
- use `{contenttype: 'application/json'}` if you want your data automatically serialized in json.
  
### EVENTS

```js
_(fn)                      ;// call fn when the dom is ready
_(sel, {click: fn})        ;// bind event to sel
_(sel, {'-click': fn}})    ;// unbind event from sel
```

### PLUGIN: MAKE YOUR OWN METHOD


```js
_.fn.yourmethod = function(selection, value){
  //selection can be a DOMElement or an array of [DOMElement]
  //to manage that, you can use _.forAll
  return _.forAll(function(elem){
    _(elem,'val='+val);
  });
};

//now you can use it
_('body',{yourmethod:42});


//example
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

_('div',{find: "span.active"});
*/

(function(W){
  "use strict";
  
  var D = W.document, rexspace = /\s+/;

  function zob(){}

  //is a pure object ?
  function iso(o){
    return Object.prototype.toString.call(o) == '[object Object]';
  }

  //is defined ?
  function def(o){
    return o!==undefined && o!==null;
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

  //callback when dom is ready
  function ready(fn){
    /complete|loaded|interactive/.test(D.readyState)
      ? fn()
      : D.addEventListener('DOMContentLoaded', fn, false)
    ;
  }

  //performs an ajax call
  function ajax(o, fn){
    var
      app  = 'application/',
      type = o.type || 'GET',
      url  = o.url || '',
      ctyp = o.contenttype || app+'x-www-form-urlencoded',
      dtyp = o.datatype || app+'json',
      efn  = o.error || zob,
      ofn  = o.ok || zob,
      xhr  = new window.XMLHttpRequest(),
      timer,d,n;
    if( o.data ){
      if( typeof(o.data)=='string' )
        //raw body
        d = o.data;
      else if( /json/.test(ctyp) )
        //serialize body as json
        d = JSON.stringify(o.data);
      else {
        //serialize body as form-urlencoded
        d = [];
        for( n in o.data )
          d.push(encodeURIComponent(n)+'='+encodeURIComponent(o.data[n]));
        d = d.join('&');
      }
      if( /GET|DEL/i.test(type) ) {
        //serialize as url arguments
        url += /\?/.test(url) ? '&'+d : '?'+d;
        d = '';
      }
    }
    xhr.onreadystatechange = function(){
      if( xhr.readyState==4 ) {
        if( timer ) clearTimeout(timer);
        if( /^2/.test(xhr.status) ) {
          d = xhr.responseText;
          if( /json/.test(dtyp) ) {
            try { d = JSON.parse(xhr.responseText) }
            catch(e) { return efn('json parse error: '+e.message, xhr) }
          }
          ofn(d, xhr);
        } else
          efn(xhr.responseText, xhr);
      }
    };
    xhr.open(type, url, true);
    xhr.setRequestHeader('Content-Type', ctyp);
    if( o.headers ) 
      for(n in o.headers) 
        xhr.setRequestHeader(n, o.headers[n]);
    if( o.timeout ) 
      timer = setTimeout(function(){
        //xhr.onreadystatechange = function(){};
        xhr.abort();
        efn('timeout',xhr);
      }, o.timeout*1000);
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
            var w = e.className.split(rexspace).filter(function(n){ return n });
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
      var n = 0, c = cls.split(rexspace);
      forall(sel, function(e){
        n += e.className.split(rexspace).filter(function(f){
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
          if( typeof(ope)=='string' )
            //hack for set content
            ope = {content: ope};
          if( iso(ope) ) 
            for( n in ope ) {
              if( typeof(ope[n])=='function' )
                //hack for -events
                n[0] == '-'
                  ? $.off(o, n.substr(1), ope[n])
                  : $.on(o, n, ope[n]);
              else if( $[n] )
                o = $[n](o, ope[n]);
            }
        }
      }
    }
    return o;
  }

  _.fn = $;
  _.forAll = forall;
  W._ = _;

})(window);