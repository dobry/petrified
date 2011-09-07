var net = {};

net.net_constructor = function (obj)
{


/*--private-vars--------------------------------------------------------------*/
  var that = {},
    canvas = new fabric.Canvas('canvas'),
    ctx = document.getElementById('canvas').getContext('2d'), // reference to canvas context
    style = "#000", // all elements color
    stroke = '#333',
    fill = '#fff',
    mR = 5, // marker radius
    pR = 30, // place radius and half of transition length
    counters = // for naming purposes
    {
      place: 0,
      transition: 0
    },
    mousePos = { x: 0, y: 0, fresh: false };

  // getting mouse position and printing it in feed label
  var feed = document.getElementById('feed');
  canvas.onmousemove = function(e)
  {
    e = e || window.event;
    mousePos = { x: e.pageX - that.offsetX, y: e.pageY - that.offsetY, fresh: true };
    feed.innerHTML = "(" + mousePos.x + ", " + mousePos.y + ")";
  };

  function setName (ele, obj)
  {
    if (!obj.name)
    {
      ele.name = ele.element + counters[ele.element];
      counters[ele.element]++;
    }
    else
    {
      ele.name = obj.name;
    }
  }  
/*--public--------------------------------------------------------------------*/

  that.offsetX = obj ? obj.offsetX : 30;
  that.offsetY = obj ? obj.offsetY : 30;

  // net elements constructors
  that.constructors = {};

  // place constructor
  that.constructors['place'] = function (obj)
  {
    var ele = new fabric.Circle({ radius: pR, stroke: stroke, fill: fill, top: obj.y, left: obj.x });
    
    ele.element = obj.element; // type of element [place|transition|arc]
    setName(ele, obj);
    ele.arcs = [];
    ele.markers = ele.markers || 0;

    // TODO markers;    

    return ele;
  };

  // transition constructor
  that.constructors['transition'] = function (obj)
  {
    var ele = new fabric.Rect({ left: obj.x, top: obj.y, stroke: stroke, fill: fill, width: 2 * mR, height: 2 * pR });   

    ele.element = obj.element;
    setName(ele, obj);
    ele.arcs = [];
    ele.angle = obj.angle || 0;
    ele.weight = ele.weight || 1;
    ele.delay = ele.delay || 1;
    
    return ele;
  };

  // arc constructor
  that.constructors['arc'] = function (obj)
  {
    var ele = {};
    
    /*setAtributes(ele, obj);

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
    };*/
    
    return ele;
  };
  
  // set whole net
  that.set = function (ele_array)
  { 
    var i;
    
    canvas.items = [];
    for (i = 0; i < ele_array.length; i++)
    {
      that.add(ele_array[i]);
    }
  };
  
  that.start = function (obj)
  {
    //alert("in net.start()");
    that.set(obj.elements);
    that.renderAll;
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
    var ele = that.constructors[proto.type](proto);
    canvas.add(ele);
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
