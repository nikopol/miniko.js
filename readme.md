miniko.js 3.3
=============

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
_.isEmpty(o,…)              // => return true if all arguments are not defined or "" or []
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