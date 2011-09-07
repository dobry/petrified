var net = {};

net.net_constructor = function (obj)
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
    mousePos = { x: 0, y: 0, fresh: false };

  var feed = document.getElementById('feed');
  
  canvas.onmousemove = function(e)
  {
    try
    {
      e = e || window.event;
      mousePos = { x: e.pageX - that.offsetX, y: e.pageY - that.offsetY, fresh: true };
      feed.innerHTML = "(" + mousePos.x + ", " + mousePos.y + ")";
      //alert("onmouseup fired");
    }
    catch (er)
    {
      alert(er.description);
      //alert(feed.innerHTML + "mousePos(" + mousePos.x + ", " + mousePos.y + ")");
    }
  };

  function setAtributes(ele, obj)
  {
    var name;

    for (name in obj) {
      if (typeof obj[name] !== 'function') {
        ele[name] = obj[name];
      }
    }
    ele.x = ele.x || mousePos.x;
    ele.y = ele.y || mousePos.y;
    if (!ele.name)
    {
      ele.name = ele.type + counters[ele.type];
      counters[ele.type]++;
    }
  };
  
/*--public--------------------------------------------------------------------*/

  // net elements constructors
  that.constructors = {};
  that.offsetX = obj ? obj.offsetX : 30;
  that.offsetY = obj ? obj.offsetY : 30;

  // place constructor
  that.constructors['place'] = function (obj)
  {
    var ele = {};
    
    setAtributes(ele, obj);
    ele.arcs = [];
    ele.markers = ele.markers || 0;
    
    ele.draw = function ()
    {
      ctx.save();
      ctx.strokeStyle = style;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(ele.x, ele.y, pR, 0, Math.PI * 2, true);
      ctx.closePath();
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
    
    setAtributes(ele, obj);
    ele.arcs = [];
    ele.angle = 0;
    ele.w = ele.w || 1;
    ele.delay = ele.delay || 1;
    
    ele.draw = function ()
    {
      //alert("in net.draw_transition()");
      ctx.save();
      ctx.translate(ele.x, ele.y);
      ctx.rotate(ele.angle);
      ctx.strokeStyle = style;
      ctx.lineWidth = 4;
      ctx.strokeRect(- mR, -pR, 2 * mR, 2 * pR);
      ctx.restore();
    };
    
    return ele;
  };

  // arc constructor
  that.constructors['arc'] = function (obj)
  {
    var ele = {};
    
    setAtributes(ele, obj);

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
        // if hole in elements array exists 
    if (undef.length !== 0)
    {
      var i = undef.pop();
      elements[i] = ele;
    }
    else
    {
      elements.push(ele);
    }
  };
  
  that.set_mouse_pos = function (obj)
  {
    mousePos = obj;
  };
  
  that.drop = function (name)
  {
    //if (mousePos.fresh)
    //{
      //alert(name + " mousePos(" + mousePos.x + ", " + mousePos.y + ")");
      that.add({ type: name });
      that.draw();
      mousePos.fresh = false;
    /*}
    else
    {
      alert("waiting for position");
      setTimeout(that.drop(name), 500);
    }*/
  };
  
  return that;
}; // end function net_constructor
