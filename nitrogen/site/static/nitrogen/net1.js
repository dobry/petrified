var net = {};

net.net_constructor = function (obj)
{


/*--private-vars--------------------------------------------------------------*/
  var that = {},
    canvas,
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
    mousePos = { x: 0, y: 0 },
    properties = {
      place: function ()
      {
        return "place";
      },
      transition: function ()
      {
        return "transition";
      },
      arc: function ()
      {
        return "arc";
      }
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
  
  function init ()
  {
    canvas = new fabric.Canvas('canvas'),
    canvas.observe('object:selected', function (e)
    {
      selectedObject = e.memo.target;
      var ele = document.getElementById("element_properties");
      if (ele)
      {
        ele.innerHTML = properties[selectedObject.element](selectedObject);
      }
    });
    
    canvas.observe('selection:created', function (e)
    {
      e.memo.target.hasControls = false;
    });
    
    // getting mouse position and printing it in feed label
    canvas.observe('mouse:move', function(e)
    {
      var feed = document.getElementById('feed');
      mousePos = { x: e.memo.e.clientX - that.offsetX, y: e.memo.e.clientY - that.offsetY };
      feed.innerHTML = "(" + mousePos.x + ", " + mousePos.y + ")";
    });
  };
 
/*--public--------------------------------------------------------------------*/

  that.offsetX = obj ? obj.offsetX : 30;
  that.offsetY = obj ? obj.offsetY : 30;
  init();

  // net elements constructors
  that.constructors = {};

  // place constructor
  that.constructors['place'] = function (obj)
  {
    var ele = new fabric.Circle({ radius: pR, stroke: stroke, fill: fill, top: obj.y, left: obj.x });
    ele.hasControls = false;
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
    var r1 = new fabric.ArrowPoint({ left: ele.get('x1'), top: ele.get('y1'), opacity: 0, width: 10, height: 10, arrow: ele, end: 'from' });
    ele.from.arcs.push(r1); // TODO place|tranasition should be group instead of this
    var r2 = new fabric.ArrowPoint({ left: ele.get('x2'), top: ele.get('y2'), opacity: 0, width: 10, height: 10, arrow: ele, end: 'to' });
    ele.to.arcs.push(r2); // TODO place|tranasition should be group instead of this
    // if points were moved, modify arrow
    canvas.observe('group:moving', function (e) {console.log("group:moving"); } )
    canvas.observe('object:moving', function(e)
    {
      var t = e.memo.target,
      moveObj = function (obj)
      {
        if (obj.type === 'arrow_point')
        {
          var a = obj.arrow;
          if (obj.end === 'from')
          {
            a.x1 = this.left + obj.left;
            a.y1 = this.top + obj.top;
          }
          else if (obj.end === 'to')
          {
            a.x2 = this.left + obj.left;
            a.y2 = this.top + obj.top;
          }
          a.width = a.x2 - a.x1 || 1;
          a.height = a.y2 - a.y1 || 1;
          a.left = a.x1 + a.width / 2;
          a.top = a.y1 + a.height / 2;
          canvas.renderAll();
        }
      };
          
      if (t.type === 'group')
      {
        t.forEachObject(moveObj, t);
      }
      else
      {
        moveObj.call({top: 0, left: 0}, t);
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
    var ele = that.constructors[proto.element](proto);
    if (utils.is_array(ele))
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
  
  that.getPointer = function ()
  {
    return canvas.getPointer();
  };
  
  that.drop = function (name)
  {
    that.add({ element: name, x: mousePos.x, y: mousePos.y });
    //alert(name + " " + pointer.x + " " + pointer.y);
    console.log(name, mousePos);
  };
  
  that.toJSON = function ()
  {
    alert("  that.toJSON = function()");
    utils.getElementsByClass("wfid_save_to_file_data")[0].value = "info zwrotne";
    // converse net data to JON
    // save it in hidden field
  };
  
  that.clean = function ()
  {
    // delete net, create new
    canvas.dispose();
    init();
  };
  
  that.menu = {};
  that.menu.selectedObject = "button-cursor";
  that.menu.setSelected = function (obj)
  {
    selectedObject = obj;
    //console.log("set selected", obj);
  };
  
  return that;
}; // end of function net_constructor
