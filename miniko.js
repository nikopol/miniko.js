//miniko.js 3.2 - https://github.com/nikopol/miniko.js

/*
minimalist "all-in-one function" javascript swiss knife with a vanilla flavor.

the base of this mini-lib is to return a *true* Array of DOM Elements
```js
_('div').forEach(e => e.style.backgroundColor = 'red');
```
except for the _('#id') selector returning directly the DOM element.
```js
_('#id').style.backgroundColor = 'red';
```


*sample usage*:
```js
_(() => { //when dom is ready...

  const but = _(
    "<button>ok</button>",  //create a button
    {
      css: {color: "red"},  //set button style
                            //set button on-click action
      click: () => console.log("click!")
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
});
```

### SELECTORS

```js
_(element)            // return the DOM Element provided
_("#id")              // return the element by its id
_("<el>...</el>")     // create the element and return it
_("<a>.</a><b>.</b>") // create the elements and return them as an array
_("tag, .classname")  // return an elements array matching the selection
```

### DOM

```js
_(sel, content)             // set content of selected elements
_(sel, {content: content})  // set content of selected elements
_(sel, {text: text})        // set text of selected elements
_(sel, {append: content})   // append content to selected elements
_(sel, {remove: true|fn})   // remove selected elements from dom if true
                            // or fn(element) returns true
_(sel, fn)                  // call fn for each elements of sel
```

### CSS

```js
_(sel, {css: {style: value}})  // set style value's
_(sel, {css: 'class'})         // set/overwrite classname to matching element(s)
_(sel, {has: 'class'})         // return number of element with class
_(sel, {css: '+C1!C2*C3'})     // + : add classname
                               // ! : remove classname
                               // * : toggle classname
```

### AJAX

```js
_({url: '?'
   type: 'GET'                                   ;default value
   data: {var1:val1} || FormData(),
   ok: (data,xhr) => {},                         ;called on success
   error: (responsetext,xhr) => {},              ;called on error
   done: (responsetext,xhr) => {},               ;called after ok or error
   accept: 'application/json',                   ;default value (wanted answer format)
   content: 'application/x-www-form-urlencoded', ;default value (payload format)
   timeout: 30,                                  ;default value (in seconds)
   headers: {key: value}
})
```

*notes*:
- return a XMLHttpRequest object
- use `{type: 'application/json'}` if you want your data automatically serialized in json.
- default settings are in the object _.ajax and are overridable

### EVENTS

```js
_(fn)                       // call fn when the dom is ready
_(sel, {click: fn})         // bind event to fn for sel
_(sel, {'-click': fn}})     // unbind fn from event for sel
```

### TOOLS

```js
_.isDefined(o,...)          // => return all arguments!==undefined && all arguments!==null
_.isFunction(fn)            // => return true if fn is a function
_.isElement(o)              // => return true if o is a DOM Element
_.isObject(o,...)           // => return true if all arguments are {...} only
_.isArray(o,...)            // => return true if all arguments are [...] only
_.asArray(o)                // => return o transformed into a "true" array
_.forAll(o, fn)             // => asArray(o).forEach(fn)
_.clone(o)                  // => return a deep clone of o
_.merge(dst,src1,...)       // => return a deep merge src* into dst

_.debounce(fn[, ms])        // => debounce 'fn' with 'ms' delay (default delay=200ms)

//example
_(window, {
  resize: _.debounce(e => { console.log(e) }, 1000)
})

_.store(k[,v])              // => set or get or unset data from local storage

//example
_.store('answer',{a: 42})   // => set answer
_.store('answer')           // => get answer: {a: 42}
_.store('answer',null)      // => unset answer
```

### PLUGIN: MAKE YOUR OWN METHOD

```js
//find children elements matching a selector
_.fn.find = (sel,val) => {
  let found = [];
  _.forAll(sel, elem => {
    if( elem.querySelectorAll )
      found = found.concat(
        _.all(elem.querySelectorAll(val))
      );
  });
  return found;
};

//now you can use it
_('div', {find: "span.active"});
```
*/

_ = (doc => {
  "use strict";

  let ajaxdft;

  const
    rexspaces = /\s+/,
    rexcss = /([\+\!\*])([^\+\!\*\s]+)/g,

    nop = () => {},

    are = fn => function(){
      const l = arguments.length;
      for( let i=0; i<l; ++i )
        if( !fn(arguments[i]) )
          return false;
      return !!l;
    },

    //is function ?
    isfn = o => typeof(o)==='function',

    //is string ?
    istr = o => typeof(o)==='string',

    //is dom ?
    isdom = o => o instanceof Element,

    //are pure object(s) ?
    iso = are(o => Object.prototype.toString.call(o) === '[object Object]'),

    //are array(s) ?
    isa = are(o => o instanceof Array),

    //are defined ?
    def = are(o => o!==undefined && o!==null),

    //merge arguments
    merge = function(dst){
      [].slice.call(arguments, 1).forEach(src => {
        if( iso(src) ) {
          if( !iso(dst) ) dst = {};
          for( let k in src )
            if( src.hasOwnProperty(k) )
              dst[k] = merge(dst[k], src[k]);
        } else
          dst = src;
      });
      return dst;
    },

    //transform to an array
    all = sel =>
      !def(sel)
        ? []
        : isa(sel)
          ? sel
          : sel instanceof Object && 'length' in sel
            ? [].slice.call(sel)
            : [sel],

    //iter a function on an array
    forall = (sel, fn) => {
      all(sel).forEach(fn);
      return sel;
    },

    //deep clone
    clone = o => {
      let x;
      if( !o || typeof o!=='object' )
        x = o;
      else if( isa(o) ) {
        x = [];
        o.forEach((z, n) => x[n] = clone(z));
      } else {
        x = {};
        for (let k in o)
          if( o.hasOwnProperty(k) )
            x[k] = clone(o[k]);
      }
      return x;
    },

    //callback when dom is ready
    ready = fn =>
      /complete|loaded|interactive/.test(doc.readyState)
        ? fn()
        : doc.addEventListener('DOMContentLoaded', fn, false),

    //make uri
    makeuri = o => Object.keys(o || {}).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(o[k])).join('&'),

    //performs an ajax call
    ajax = (o, fn) => {
      const xhr = new window.XMLHttpRequest(), isform = o.data && o.data instanceof FormData;
      let wbody, timer, d, n;
      for( n in ajaxdft )
        o[n] = o[n] || ajaxdft[n];
      if( o.data ){
        wbody = /POST|PUT/i.test(o.type);
        if( wbody ) {
          if( istr(o.data) || isform )
            d = o.data; //raw body
          else if( /json/i.test(o.content) )
            d = JSON.stringify(o.data);
          else if( /form-urlencoded/i.test(o.content) )
            d = makeuri(o.data)
        } else
          //serialize as url arguments
          o.url += (o.url.indexOf('?')===-1 ? '?' : '&') + makeuri(o.data);
      }
      xhr.onreadystatechange = () => {
        if( xhr.readyState===4 ) {
          clearTimeout(timer);
          d = xhr.responseText;
          if( /json/i.test(o.accept) ) {
            try {
              d = JSON.parse(xhr.responseText);
            } catch(e) {
              console.log('ajax json parse error: '+e.message, xhr);
            }
          }
          o.done(o[(xhr.status+'')[0]==='2'?'ok':'error'](d, xhr));
        }
      };
      xhr.open(o.type, o.url);
      if( isform ) delete o.headers['Content-Type'];
      else if( o.content ) o.headers['Content-Type'] = o.content;
      if( o.accept ) o.headers['Accept'] = o.accept;
      for(n in o.headers)
        xhr.setRequestHeader(n, o.headers[n]);
      if( o.timeout )
        timer = setTimeout(() => {
          xhr.abort();
          o.done(o.error('timeout',xhr));
        }, o.timeout*1000);
      xhr.send(d);
      return xhr;
    },

    //base _ fn
    $ = {

      content: (sel, content) =>
        forall(sel, istr(content)
          ? e => e.innerHTML = content
          : e => {
              e.innerHTML = '';
              forall(content, o => e.appendChild(o));
          }),

      text: (sel, content) =>
        forall(sel, e => { e.innerText = content || '' }),

      append: (el, content) => {
        if( isa(el) ) el = el.shift();
        if( def(el) ){
          if( istr(content) ){
            const z = el.tagName === 'TBODY'
              ? _('<table>', content).children[0].childNodes
              : _('<div>', content).childNodes;
            while( z.length ) el.appendChild(z[0]);
          } else {
            forall(content, e => el.appendChild(e));
          }
        }
        return el;
      },

      remove: (sel, fn) =>
        forall(sel, isfn(fn)
          ? e => fn(e) && e.remove()
          : fn
            ? e => e.remove()
            : nop
        ),

      css: (sel, cls) => {
        let m;
        if( iso(cls) ) {
          //set mode
          forall(sel, e => {
            for(m in cls) e.style[m] = cls[m];
          });
        } else if( /^[\+\!\*]/.test(cls) ) {
          //add/remove/toggle mode
          while( (m = rexcss.exec(cls)) !== null ) {
            const z = m[1],
                  v = m[2];
            forall(sel, e => {
              let w = e.className.split(rexspaces).filter(n => n);
              if( z!=='!' && w.indexOf(v)===-1 ) {
                //add class
                w.push(v);
              } else if( z !== '+' ) {
                //remove class
                w = w.filter(n => n!==v);
              }
              e.className = w.join(' ');
            });
          }
        } else
          //set mode
          forall(sel, e => { e.className = cls });
        return sel;
      },

      has: (sel, cls) => {
        const c = cls.split(rexspaces);
        return all(sel).reduce((n, e) => n + e.className.split(rexspaces).filter(f => c.indexOf(f) !== -1).length, 0);
      },

      on: (sel, events, fn) =>
        forall(sel, d => {
          if( iso(events) )
            for(let e in events)
              d.addEventListener(e, events[e]);
          else
            d.addEventListener(events, fn);
        }),

      off: (sel, events, fn) =>
        forall(sel, d => {
          if( iso(events) )
            for(let e in events)
              d.removeEventListener(e, events[e]);
          else
            d.removeEventListener(events, fn);
        })

    },

    //all in one to rule them all
    _ = (sel, ope) => {
      let o, l, n;
      if( def(sel) ) {
        if( isfn(sel) ) {
          //first argument is a function -> on ready
          ready(sel);
        } else if( iso(sel) ) {
          //first argument is a pure object -> ajax call
          o = ajax(sel);
        } else {
          //first argument in selector mode
          if( istr(sel) ) {
            if( /^#[^ ,\.\>\<]*$/.test(sel) ) {
              //selector is an #id
              o = doc.getElementById(sel.substr(1));
            } else if( /^<.+>$/.test(sel) ) {
              //selector is html string
              (n = doc.createElement('div')).innerHTML = sel;
              l = all(n.childNodes);
              o = l.length > 1
                ? l
                : l.length
                  ? l[0]
                  : undefined;
            } else {
              //selector is a query selector
              o = all(doc.querySelectorAll(sel));
            }
          } else
            //selector is a (array of) DOM Element
            o = sel;
          if( o && def(ope) ) {
            if( istr(ope) || isdom(ope) )
              //hack for set content
              ope = {content: ope};
            if( iso(ope) )
              for( n in ope ) {
                if( $[n] )
                  o = $[n](o, ope[n]);
                else if( isfn(ope[n]) )
                  //hack for -events
                  n[0] === '-'
                    ? $.off(o, n.substr(1), ope[n])
                    : $.on(o, n, ope[n]);
              }
            if( isfn(ope) )
              forall(o, ope);
          }
        }
      }
      return o;
    };

  _.fn = $;
  _.debounce = (fn, delay) => {
    let timer;
    return function(){
      const args = _.asArray(arguments);
      clearTimeout(timer);
      timer = setTimeout(e => {
        timer = null;
        fn.apply(this, args);
      }, delay || 200);
    };
  };
  _.store = function(k, v){
    return arguments.length === 1
      ? JSON.parse(localStorage.getItem(k))
      : def(v)
        ? localStorage.setItem(k, JSON.stringify(v))
        : localStorage.removeItem(k);
  };
  _.isObject = iso;
  _.isFunction = isfn;
  _.isString = istr;
  _.isElement = isdom;
  _.isArray = isa;
  _.asArray = all;
  _.isDefined = def;
  _.forAll = forall;
  _.ajax = ajaxdft = {
    type: 'GET',
    url: '',
    data: false,
    headers: {},
    content: 'application/x-www-form-urlencoded',
    accept: 'application/json',
    error: nop,
    ok: nop,
    done: nop,
    timeout: false
  };
  _.clone = clone;
  _.merge = merge;

  return _;
})(document);