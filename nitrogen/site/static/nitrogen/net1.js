var is_array = function (value)
{
  return Object.prototype.toString.apply(value) === '[object Array]';
};

var net = {};

net.net_constructor = function (obj)
{


/*--private-vars--------------------------------------------------------------*/
  var that = {},
    canvas = new fabric.Canvas('canvas'),
    ctx = document.getElementById('canvas').getContext('2d'), // reference to canvas context
    style = "#000", // all elements color
    stroke = '#333',
    strokeWidth = 3,
    fill = '#fff',
    mR = 5, // marker radius
    pR = 30, // place radius and half of transition length
    counters = // for naming purposes
    {
      place: 0,
      transition: 0,
      arc: 0
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
    
    ele.lockScalingX = ele.lockScalingY = ele.lockRotation = true;
    ele.element = obj.element; // type of element [place|transition|arc]
    setName(ele, obj);
    ele.arcs = []; // TODO place should be group instead of this
    ele.markers = ele.markers || 0;

    // TODO markers;    

    return ele;
  };

  // transition constructor
  that.constructors['transition'] = function (obj)
  {
    var ele = new fabric.Rect({ left: obj.x, top: obj.y, stroke: stroke, fill: fill, width: 2 * mR, height: 2 * pR });   

    ele.lockScalingX = ele.lockScalingY = true;
    ele.element = obj.element;
    setName(ele, obj);
    ele.arcs = []; // TODO tranasition should be group instead of this
    ele.angle = obj.angle || 0;
    ele.weight = ele.weight || 1;
    ele.delay = ele.delay || 1;
    
    return ele;
  };

  // arc constructor
  that.constructors['arc'] = function (obj)
  {
    // create arrow
    var from, to, points;
    if (obj.from)
    {
      from = that.findByName(obj.from);
      points = [from.left, from.top];
    }
    if (obj.to)
    {
      to = that.findByName(obj.to);
      points.push(to.left);
      points.push(to.top);
    }
    var ele = new fabric.Line(points);
    ele.selectable = false;
    ele.from = from;
    ele.to = to;
    ele.element = obj.element;
    setName(ele, obj);
    // create arrow points
    var r1 = new fabric.Rect({ left: ele.get('x1'), top: ele.get('y1'), opacity: 0, width: 10, height: 10 });
    r1.lockScalingX = r1.lockScalingY = r1.lockRotation = true;
    r1.hasControls = false;
    r1.arrow = ele;
    r1.point_type = 'arrow_from';
    ele.from.arcs.push(r1); // TODO place|tranasition should be group instead of this
    var r2 = new fabric.Rect({ left: ele.get('x2'), top: ele.get('y2'), opacity: 0, width: 10, height: 10 });
    r2.lockScalingX = r2.lockScalingY = r2.lockRotation = true;
    r2.hasControls = false;
    r2.arrow = ele;
    r2.point_type = 'arrow_to';
    ele.to.arcs.push(r2); // TODO place|tranasition should be group instead of this
    // if points were moved, modify arrow
    canvas.observe('object:moving', function(e)
    {
      var p = e.memo.target,
          a = p.arrow;
      if (p.point_type === 'arrow_from')
      {
        a.x1 = p.left;
        a.y1 = p.top;
        a.width = a.x2 - a.x1 || 1;
        a.height = a.y2 - a.y1 || 1;
        a.left = a.x1 + a.width / 2;
        a.top = a.y1 + a.height / 2;
        canvas.renderAll();
      }
      else if (p.point_type === 'arrow_to')
      {
        a.x2 = p.left;
        a.y2 = p.top;
        a.width = a.x2 - a.x1 || 1;
        a.height = a.y2 - a.y1 || 1;
        a.left = a.x1 + a.width / 2;
        a.top = a.y1 + a.height / 2;
        canvas.renderAll();
      }
    });

    // TODO rysowanie grotu stycznego do łuku
    
    return [ele, r1, r2];
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

  that.findByName = function (name)
  {
    var i, array = canvas.getObjects();
    for (i = 0; i < array.length; i++)
    {
      if (array[i].name === name)
      {
        return array[i];
      }
    }
  };

  that.get = function (i)
  {
    return canvas.item(i);
  };
  
  that.add = function (proto)
  {
    var ele = that.constructors[proto.type](proto);
    if (is_array(ele))
    {
      var i;
      for (i = 0; i < ele.length; i++)
      {
        canvas.add(ele[i]);
      }
    }
    else
    {
      canvas.add(ele);
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
