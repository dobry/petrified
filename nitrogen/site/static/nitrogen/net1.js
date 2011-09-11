var net = {};

net.net_constructor = function (obj)
{


/*--private-vars--------------------------------------------------------------*/
  var that = {},
    canvas,
    style = "#000", // all elements color
    stroke = '#333',
    strokeWidth = 2,
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
      canvas.renderAll();
    });

    canvas.observe('object:out', function(e) {
      e.memo.target.setStroke('black');
      canvas.renderAll();
    });
  
    // TODO show element properties when object and menu properties is selected
    canvas.observe('object:selected', function (e)
    {
      selectedObject = e.memo.target;
      var ele = document.getElementById("element_properties");
      if (ele)
      {
        ele.innerHTML = properties[selectedObject.get('element')](selectedObject);
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
      if (e.memo.target)
      {
        console.log("o", e.memo.target.name);
      }
      mousePos = { x: e.memo.e.clientX - that.offsetX, y: e.memo.e.clientY - that.offsetY };
      feed.innerHTML = "(" + mousePos.x + ", " + mousePos.y + ")";
    });
    
    canvas.observe('mouse:down', function(e)
    {
      var obj = e.memo.target;
      if (obj && obj.type && obj.type === 'arrow_point')
      {
        //canvas.sendToBack(obj);
        console.log("łooeeeeeeeeeee");
      }
    });
    
    canvas.observe('mouse:up', function(e)
    {
      //console.log("mouse:up - menu elements");
      var element, obj, target
        button = that.menu.selectedObject,
        menu = that.menu.selectedMenu;
      // check if element from menu is added
      if (menu === 'elements' && button !== 'button-cursor')
      {
        element = (button.split('-'))[1];
        that.add({ x: mousePos.x, y: mousePos.y, element: element });
      }
      //
      else
      {
        obj = e.memo.target;
        if (obj && obj.type && obj.type === 'arrow_point')
        {
          canvas.sendToBack(obj);
          
          target = canvas.findTarget(e.memo.e);

          // remove old relation
          if (obj.belongsTo)
          {
            obj.belongsTo.remove(obj);
            obj.belogsTo = null;
            console.log("state of obj.belongsTo",obj.belongsTo);
          }

          // create new relation, if target is present
          if (target && target.add)
          {
            console.log("adding new relation with", target);
            target.add(obj);
            obj.belongsTo = target;          
          }
          //console.log(canvas.containsPoint(e.memo.e, obj.belongsTo), obj.belongsTo.left, canvas.getPointer(e.memo.e));
          console.log("łoo", target);
          canvas.bringToFront(obj);
        }
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
    //console.log("construct place", obj);
    var ele = new fabric.Place({ 
      markers: obj.markers, 
      strokeWidth: strokeWidth, 
      radius: pR, 
      stroke: stroke, 
      fill: fill, 
      top: obj.y, 
      left: obj.x,
      name: genName(obj),
      mR: mR,
      element: obj.element
    });
    return ele;
  };

  // transition constructor
  that.constructors['transition'] = function (obj)
  {
    //console.log("construct trans");
    //console.log(obj);
    var ele = new fabric.Transition({
      strokeWidth: strokeWidth,
      left: obj.x,
      top: obj.y, 
      stroke: stroke, 
      fill: fill, 
      width: 2 * mR, 
      height: 2 * pR,
      mR: mR,
      radius: pR, 
      element: obj.element,
      name: genName(obj),
      beta: obj.angle || 0,
      weight: obj.weight || 1,
      delay: obj.delay || 1
    });
    return ele;
  };

  // arc constructor
  that.constructors['arc'] = function (obj)
  {
    //console.log("construct arc", obj);
    var p1, p2, arrow, from, to;
    
    // init grip point with its owner if exist or coords from mouse
    if (obj.from)
    {
      var owner = that.findByName(obj.from);
      //console.log("aaaaa!", owner);
      p1 = new fabric.ArrowPoint({ belongsTo: owner, end: 'from' });
      //console.log("aaaaa!",p1, owner);
    }
    else
    {
      p1 = new fabric.ArrowPoint({ left: obj.x - 20, top: obj.y - 20, end: 'from' });
    }
    //console.log("uuuuuu", obj.to);
    if (obj.to)
    {
      var owner = that.findByName(obj.to);
      p2 = new fabric.ArrowPoint({ belongsTo: owner, end: 'to' });
      //console.log("bbbb!",obj.to, p1, owner);
    }
    else
    {
      p2 = new fabric.ArrowPoint({ left: mousePos.x + 20, top: mousePos.y + 20, end: 'to' });
    }
    
    
    // create arrow and its handles
    arrow = new fabric.Arrow({ strokeWidth: that.strokeWidth, from: p1, to: p2, element: obj.element, name: genName(obj) });
    
    return [p1, p2];//, arrow];
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
    //console.log("find by name", name);
    for (i = 0; i < array.length; i++)
    {
    //console.log("find", array[1]);        
      if (array[i].name === name)
      {
    //console.log("find if inside", array[1]);        
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
  };
  
  that.menu.change = function (Name)
  {
    that.menu.selectedMenu = Name;
  }
  
  return that;
}; // end of function net_constructor
