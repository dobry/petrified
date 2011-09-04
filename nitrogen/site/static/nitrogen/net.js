var net = {};

net.net_constructor = function (_elements)
{


/*--private-vars--------------------------------------------------------------*/
  var that = {},
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'), // reference to canvas context
    elements = [], // list of elements to render
    undef = [], // this array remembers holes in elements array, which emerge when an elements is removed
    style = "#000", // all elements color
    mR = 5, // marker radius
    pR = 30, // place radius and half of transition length
    counters = 
    {
      place: 0,
      transition: 0
    },
    mousePos = { x: 0, y: 0 };

  
  if (_elements)
  {
    set(_elements);
  }
  
  canvas.onmouseup = function(e)
  {
    e = e || window.event;
    mousePos = { x: e.pageX, y: e.pageY };
    //alert("mousePos(" + mousePos.x + ", " + mousePos.y + ")");
  };

  function copyAtributes(ele, obj)
  {
    var name;

    for (name in obj) {
      if (typeof obj[name] !== 'function') {
        ele[name] = obj[name];
      }
    }
  };
  
/*--public--------------------------------------------------------------------*/

  // net elements constructors
  that.constructors = {};

  // place constructor
  that.constructors['place'] = function (obj)
  {
    var ele = {};
    
    copyAtributes(ele, obj);
    ele.arcs = [];
    
    ele.draw = function ()
    {
      //alert("in net.draw_place()");
      ctx.restore();
      ctx.save();
      ctx.translate(ele.x, ele.y);
      ctx.strokeStyle = style;
      ctx.beginPath();
      ctx.arc(0, 0, pR, 0, Math.PI * 2, true);
      ctx.stroke();
      ctx.closePath();
      // TODO draw_markers(ele.markers);
      ctx.restore();
    };
    
    return ele;
  };

  // transition constructor
  that.constructors['transition'] = function (obj)
  {
    var ele = {};
    
    copyAtributes(ele, obj);
    ele.arcs = [];
    ele.angle = 0;
    
    ele.draw = function ()
    {
      //alert("in net.draw_transition()");
      ctx.save();
      ctx.translate(ele.x, ele.y);
      ctx.rotate(ele.angle);
      ctx.strokeStyle = style;
      ctx.strokeRect(- mR, -pR, 2 * mR, 2 * pR);
      ctx.restore();
    };
    
    return ele;
  };

  // arc constructor
  that.constructors['arc'] = function (obj)
  {
    var ele = {};
    
    copyAtributes(ele, obj);

    ele.from = that.get(ele.from);
    ele.to = that.get(ele.to);
    ele.from.arcs.push(ele);
    ele.to.arcs.push(ele);

    ele.draw = function ()
    {
      //alert("in net.draw_arc()");
      ctx.save();
      ctx.moveTo(ele.from.x, ele.from.y);
      ctx.StrokeStyle = style;
      ctx.lineTo(ele.to.x, ele.to.y);
      ctx.stroke();
      
      // grot łuku
      // TODO rysowanie grotu stycznego do łuku
      //ctx.arc(0, 0, 10, mR, Math.PI * 2, true);
      //ctx.fill();
      
      ctx.restore();
    };
    
    return ele;
  };
  
  // draw: renders all elements
  that.draw = function ()
  {
    //alert("in net.draw()");
    var i;
    
    // clear  canvas
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // draw all elements
    for (i = 0; i < elements.length; i++)
    {
      if (elements[i])
      {
        elements[i].draw();
      }
    }
    //alert("i = " + i + "; out of net.draw()");
  };
  
  // set whole net
  that.set = function (ele_array)
  { 
    //alert("in net.set()");
    var i;
    
    elements = [];
    for (i = 0; i < ele_array.length; i++)
    {
      that.add(ele_array[i]);
    }
  };
  
  that.start = function (obj)
  {
    //alert("in net.start()");
    that.set(obj.elements);
    that.draw();
  };

  // get element by name
  that.get = function (name)
  {
    var i;
    for (i = 0; i < elements.length; i++)
    {
      if (elements[i].name === name)
      {
        return elements[i];
      }
    }
  };
  
  that.add = function (proto)
  {
    //alert(proto);
    var ele = that.constructors[proto.type](proto);
    elements.push(ele);
  };
  
  that.drop = function (name)
  {
    //alert("mousePos(" + mousePos.x + ", " + mousePos.y + ")");
    alert(name + " mousePos(" + mousePos.x + ", " + mousePos.y + ")");
//          name: name + counter.name
    /*var obj = 
    {
      type: name,
      x: mousePos.x,
      y: mousePos.y
    };
    that.add()*/
  };
  
  return that;
}; // end function net_constructor
