miniko.js 2.3
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
  "<button>hit me!</button>", {
    css: {color: "red"},
    click: function(){ console.log("click!") }
  }
);

_('body', {append: but,
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
   ok: function(data,xhr){},                         ; called on success
   error: function(responsetext,xhr){},              ; called on error
   done: function(responsetext,xhr){},               ; called after ok or error
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
_.isDefined(o)             ;// => return o!==undefined && o!==null
_.forAll(o, fn)            ;// => tranform o in array (if necessary) and apply a forEach(fn)
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