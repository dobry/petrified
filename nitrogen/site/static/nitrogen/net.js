//document.write("net");

var net = {};

net.net_constructor = function (_elements)
{


/*--private-vars--------------------------------------------------------------*/
  var that = {};
  var ctx = document.getElementById('canvas').getContext('2d'); // reference to canvas context
  var elements = []; // list of elements to render
  var undef = []; // this array remembers holes in elements array, which emerge when an elements is removed
  var style = "#000"; // all elements color
  var mR = 5; // marker radius
  var pR = 30; // place radius and half of transition length


  if (_elements)
  {
    set(_elements);
  }


/*--public--------------------------------------------------------------------*/

  // net elements constructors
  that.constructors = {};

  // place constructor
  that.constructors['place'] = function (obj)
  {
    var ele = {};
    var name;
    
    // copy initialization values
    for (name in obj) {
      if (typeof obj[name] !== 'function') {
        ele[name] = obj[name];
      }
    }

    // add drawing function
    ele.draw = function ()
    {
      //alert("in net.draw_place()");
      ctx.restore();
      ctx.save();
      ctx.translate(ele.x, ele.y);
      ctx.strokeStyle = style;
      ctx.arc(0, 0, pR, 0, Math.PI * 2, true);
      ctx.stroke();
      // TODO draw_markers(ele.markers);
      ctx.restore();
    };
    
    return ele;
  };

  // transition constructor
  that.constructors['transition'] = function (obj)
  {
    var ele = {};
    var name;
    
    // copy initialization values
    for (name in obj) {
      if (typeof obj[name] !== 'function') {
        ele[name] = obj[name];
      }
    }

    ele.angle = 0;
    
    // add drawing function
    ele.draw = function ()
    {
      //alert("in net.draw_transition()");
      /*
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = style;  
      ctx.strokeRect(0, -pR, 2 * mR, 2 * pR);
      ctx.restore();*/
    };
    
    return ele;
  };

  // arc constructor
  that.constructors['arc'] = function (obj)
  {
    var ele = {};
    var name;
    
    // copy initialization values
    for (name in obj) {
      if (typeof obj[name] !== 'function') {
        ele[name] = obj[name];
      }
    }

    // add drawing function
    ele.draw = function ()
    {
      //alert("in net.draw_arc()");
      /*ctx.save();
      ctx.translate(x0, y0);
      ctx.StrokeStyle = style;
      ctx.lineTo(x1, x2);
      ctx.stroke();
      // TODO rysowanie strzałki stycznej do łuku
      ctx.fillStyle = style;
      ctx.arc(0, 0, 10, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.restore();*/
    };
    
    return ele;
  };
  
  // draw: renders all elements
  that.draw = function ()
  {
    alert("in net.draw()");
    var i;
    for (i = 0; i < elements.length; i++)
    {
      if (elements[i])
      {
        elements[i].draw();
      }
    }
    alert("i = " + i + "; out of net.draw()");
  };
  
  // set whole net
  that.set = function (ele_array)
  { 
    //alert("in net.set()");
    var i, ele;
    
    elements = [];
    for (i = 0; i < ele_array.length; i++)
    {
      ele = that.constructors[ele_array[i].type](ele_array[i]);
      elements.push(ele);
    }
  };
  
  that.start = function (obj)
  {
    //alert("in net.start()");
    that.set(obj.elements);
    that.draw();
  }

  //alert("out of net_constructor()");
  return that;
}; // end function net_constructor
