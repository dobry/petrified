var net = function net_constructor () {

  var net = {};
  
  
/*-------------private-------------*/
  
  var ctx = document.getElementById('canvas'); // reference to canvas
  var elements = []; // list of elements to render
  var undef = []; // this array remembers holes in elements array, which emerge when an elements is removed
  

/*-------------public-------------*/

  // draw: renders all elements
  net.draw = function ()
  {      
    //private
    var style = "#dddddd"; // all elements color
    var markerR = 10; // marker radius
    var placeR = 60; // place radius
    
    //TODO private drawing helpers for every type of element
    
    return function draw()
    {
      var i;
      for (i = 0; i < elements.length; i++)
      {
        // if element i is defined draw it
        if (elements[i])
        {
          elements[i].draw();
        }
      }
    };
  }();
  
  net.add = function (_new)
  {
    // if hole in elements array exists 
    if (undef.length === 0)
    {
      var id = undef.pop();
      elements[id] = _new;
    }
    else
    {
      elements.push(_new);
    }
  };

  net.remove = function (id)
  {
    //document.getElementById('feed').firstChild.nodeValue += "remove";
    undef.push(id);
    delete elements[id];
  };
    
  // update whole element
  net.update = function (id, ele) { element[id] = ele; },
    
  // update given field
  net.set = function (id, field, value) { elements[id][field] = value; }

  return net;
}(); // end function net_constructor
