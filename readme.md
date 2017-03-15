miniko.js 1.0
=============

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
_.append(sel,html)        //append html to matching element(s)
```

**style**  

```javascript
_.css(sel,'class')        //set/overwrite classname to matching element(s)
_.css(sel,'+C1-C2*C3')    //add C1 to matching element(s) and
                        //remove C2 to matching element(s) and
                        //toggle C3 to matching element(s)
_.css(sel,'?class')       //return the count of class used by matching element(s)
_.css(sel,{style:value})  //style's values to matching element(s)
```
  
**geometry**

```javascript
_.pos(element)
_.pos("#id")       //return {left,top,width,height}
```

**ajax**
  
```javascript
_.ajax(url,ok)            //perform a GET ajax call
_.ajax({                  //perform an ajax call
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
_.ready(callback)                   // callback when the dom is ready
_.on(sel,event,callback[,options])  // bind event to sel
_.off(sel,event,callback)           // unbind event  sel
```