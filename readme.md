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
