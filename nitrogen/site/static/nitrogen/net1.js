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

  function genName (obj)
  {
    var name;
    if (!obj.name)
    {
      name = obj.element + counters[obj.element];
      counters[obj.element]++;
    }
    else
    {
      name = obj.name;
    }
    return name;
  }
  
  function init ()
  {
    canvas = new fabric.Canvas('canvas'),

    // piggyback on `canvas.findTarget`, to fire "object:over" and "object:out" events
    canvas.findTarget = (function(originalFn) {
      return function() {
        var target = originalFn.apply(this, arguments);
        if (target) {
          if (this._hoveredTarget !== target) {
            canvas.fire('object:over', { target: target });
            if (this._hoveredTarget) {
              canvas.fire('object:out', { target: this._hoveredTarget });
            }
            this._hoveredTarget = target;
          }
        }
        else if (this._hoveredTarget) {
          canvas.fire('object:out', { target: this._hoveredTarget });
          this._hoveredTarget = null;
        }
        return target;
      };
    })(canvas.findTarget);
    
    canvas.observe('object:over', function(e) {
      e.memo.target.setStroke('rgb(227, 195, 46)');
      //canvas.objectOver = e.memo.target;
      //canvas.objectOver.setStroke('rgb(227, 195, 46)');
      canvas.renderAll();
    });

    canvas.observe('object:out', function(e) {
      e.memo.target.setStroke('black');
      //canvas.objectOver = null;
      //canvas.objectOver.setStroke('black');
      canvas.renderAll();
    });
  
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
    
    // adding element when
    canvas.observe('mouse:up', function(e)
    {
      //console.log("mouse:up - menu elements");
      var element,
        button = that.menu.selectedObject,
        menu = that.menu.selectedMenu;
      if (menu === 'elements' && button !== 'button-cursor')
      {
        element = (button.split('-'))[1];
        //console.log(element, button);
        //console.log({ left: mousePos.x, top: mousePos.y, element: element });
        that.add({ x: mousePos.x, y: mousePos.y, element: element });
      }
    });
  };
 
/*--public--------------------------------------------------------------------*/

  that.offsetX = obj ? obj.offsetX : 30;
  that.offsetY = obj ? obj.offsetY : 30;
  init();

  that.canvas = canvas;
  
  // net elements constructors
  that.constructors = {};

  // place constructor
  that.constructors['place'] = function (obj)
  {
    var ele = new fabric.Circle({ strokeWidth: 2, radius: pR, stroke: stroke, fill: fill, top: obj.y, left: obj.x });
    ele.hasControls = false;
    ele.element = obj.element; // type of element [place|transition|arc]
    ele.name = genName(obj);
    ele.arcs = []; // TODO place should be group instead of this
    ele.markers = ele.markers || 0;

    // TODO markers;    

    return ele;
  };

  // transition constructor
  that.constructors['transition'] = function (obj)
  {
    var ele = new fabric.Rect({ strokeWidth: 2, left: obj.x, top: obj.y, stroke: stroke, fill: fill, width: 2 * mR, height: 2 * pR });   

    ele.lockScalingX = ele.lockScalingY = true;
    ele.element = obj.element;
    ele.name = genName(obj);
    ele.arcs = []; // TODO tranasition should be group instead of this
    ele.angle = obj.angle || 0;
    ele.weight = ele.weight || 1;
    ele.delay = ele.delay || 1;
    
    return ele;
  };

  // arc constructor
  that.constructors['arc'] = function (obj)
  {
    var p1, p2, arrow, from, to;
    
    
    // init grip point with its owner if exist or coords from mouse
    if (obj.from)
    {
      var owner = that.findByName(obj.from);
      //console.log(owner);
      p1 = new fabric.ArrowPoint({ belongsTo: owner, end: 'from' })
    }
    else
    {
      p1 = new fabric.ArrowPoint({ left: obj.x - 20, top: obj.y - 20, end: 'from' })
    }
    if (obj.to)
    {
      var owner = that.findByName(obj.to);
      //console.log(owner);
      p2 = new fabric.ArrowPoint({ belongsTo: owner, end: 'to' });
    }
    else
    {
      p2 = new fabric.ArrowPoint({ left: mousePos.x + 20, top: mousePos.y + 20, end: 'to' });
    }
    
    
    // create arrow and its handles
    arrow = new fabric.Arrow({ from: p1, to: p2, element: obj.element, name: genName(obj) });
    
    return [arrow, p1, p2];
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
    console.log("cleaning");
    // delete net, create new
    canvas.dispose();
    init();
    console.log("cleaned");
  };
  
  that.menu = {};
  that.menu.selectedObject = "button-cursor";
  that.menu.selectedMenu = null;
  that.menu.setSelected = function (obj)
  {
    that.menu.selectedObject = obj;
    if (obj !== "button-cursor")
    {
      // turn on object selection
      canvas.selection = false;//true;
    }
    else 
    {
      // turn off selection
      canvas.selection = true;//false;    
    }
    //console.log("set selected", obj);
  };
  
  that.menu.change = function (Name)
  {
    //console.log("change", Name);
    that.menu.selectedMenu = Name;
    //console.log("menu: " + Name);
  }
  
  return that;
}; // end of function net_constructor
