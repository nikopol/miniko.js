miniko.js 0.7
=============

~L~ niko  

minimalist javascript survival library


**selectors**


```javascript
_(element,[content])    //return the element provided
_("#id",[content])      //return the element by id
_("<el>...</el>")       //create and return element(s)
_("selector",[content]) //return an elements array matching a selector
```

all these methods setup innerHTML if content is provided

**manipulation**

```javascript
append(sel,html)        //append html to matching element(s)
```

**style**  

```javascript
css(sel,'class')        //set/overwrite classname to matching element(s)
css(sel,'+C1-C2*C3')    //add C1 to matching element(s) and
                        //remove C2 to matching element(s) and
                        //toggle C3 to matching element(s)
css(sel,'?class')       //return the count of class used by matching element(s)
css(sel,{style:value})  //style's values to matching element(s)
```
  
**geometry**

```javascript
position(element)
position("#id")       //return {left,top,width,height}
```

**ajax**
  
```javascript
ajax(url,ok)            //perform a GET ajax call
ajax({                  //perform an ajax call
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
```
  
**events**

```javascript
ready(callback) // callback when the dom is ready
```