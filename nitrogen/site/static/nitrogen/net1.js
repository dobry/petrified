var net = {};

net.net_constructor = function (obj)
{


/*--private-vars--------------------------------------------------------------*/
  var that = {},
    simulationSpeed = 1000, //time of transition in ms
    canvas,
    style = "#000", // all elements color
    stroke = '#333',
    strokeWidth = 2,
    fill = '#fff',
    mR = 5, // marker radius
    pR = 30, // place radius and half of transition length
    counters = // for naming and generating id purposes
    {
      id: 0,
      place: 0,
      transition: 0,
      arc: 0
    },
    mousePos = { x: 0, y: 0 },
    properties = {
      place: function (obj)
      {
        return "place<br />" + 
        "name: " + obj.get('name') + "<br />" +
        "left: " + obj.get('left') + "<br />" +
        "top: " + obj.get('top') + "<br />";
      },
      transition: function (obj)
      {
        return "transition<br />" + 
        "name: " + obj.get('name') + "<br />" +
        "left: " + obj.get('left') + "<br />" +
        "top: " + obj.get('top') + "<br />" +
        "angle: " + obj.get('angle') + "<br />" +
        "theta: " + obj.get('theta') + "<br />";
      },
      arc: function (obj)
      {
        //console.log(obj);
        return "arc<br />" + 
        "name: " + obj.get('name') + "<br />" +
        "left: " + obj.get('left') + "<br />" +
        "top: " + obj.get('top') + "<br />";
      }
    };

  // generates unique id for given obj type (and name if needed)
  function genIdentity (obj)
  {
    var id = counters['id'];
    counters[obj.element]++;
    counters['id']++;
    return {
      name : (!obj.name ? obj.element + counters[obj.element] : obj.name),
      id : id
    };
  }
  
  function init ()
  {
    canvas = new fabric.Canvas('canvas');
    
    //disable group selection
    canvas.selection = false;
    //enable object selection
    //canvas.objectSelection = true;
    
    
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
    canvas.observe('mouse:move', function (e)
    {
      var feed = document.getElementById('feed');
      mousePos = { x: e.memo.e.clientX - that.offsetX, y: e.memo.e.clientY - that.offsetY };
      feed.innerHTML = "(" + mousePos.x + ", " + mousePos.y + ")";
    });
    
    /*canvas.observe('mouse:down', function (e)
    {
      e.memo.target && canvas.setToBack(e.memo.target);
    });*/
    
    canvas.observe('mouse:up', function (e)
    {
      var i, element, obj, target,
        button = that.menu.selectedObject,
        menu = that.menu.selectedMenu;
      
      // check if element from menu is added
      console.log(button);
      if (button === 'button-marker')
      {
        //element = (button.split('-'))[1];
        target = e.memo.target;
        if (target && target.type === 'place')
        {
          target.addMarker();
          canvas.renderAll();
        }
        //target = canvas.findTarget(e.memo.e);
        //console.log(e.memo.target, target, element);
        //that.add({ x: mousePos.x, y: mousePos.y, element: element });                
      }
      else if (button === 'button-delete')
      {
        target = e.memo.target;
        console.log(target);
        if (target)
        {
          if (target.type === 'place' || target.type === 'transition')
          {
            for (i = 0; i < target.points.length; i++)
            {
              if (target.points[i])
              {
                target.points[i].belongsTo = null;              
              }
            }
            canvas.remove(target);
          }
          else if (target.type === 'arrow_point')
          {
            i = target.arrow;
            canvas.remove(i.to);
            canvas.remove(i.from);
            //canvas.remove(i);
          }
          canvas.renderAll();
        }
      }
      else if (button !== 'button-cursor')
      {
        element = (button.split('-'))[1];
        that.add({ x: mousePos.x, y: mousePos.y, element: element });
      }
      // check if some arrow was moved
      else
      {
        //console.log("tutaj?");
        obj = e.memo.target;
        if (obj && obj.type === 'arrow_point')
        {
          // push obj on the bottom, and if anything besides obj is here, it will come to surface
          canvas.sendToBack(obj);
          target = canvas.findTarget(e.memo.e);

          // remove old relation from obj
          if (obj.belongsTo)
          {
            obj.belongsTo.remove(obj);
            obj.belogsTo = null;
          }

          // create new relation, if target is present
          if (target && target.add)
          {
            target.add(obj);
            obj.belongsTo = target;          
          }
          // bring back obj to the front, so it could be grabbed again without 
          // moving other elements from the spot
          canvas.bringToFront(obj);
        }
      }
    });
    
    // initiate simulation buttons
    var buttons = utils.getElementsByClass("sim_button");
    buttons[0].disabled = true;
    buttons[1].disabled = true;
    buttons[2].disabled = true;
    buttons[3].disabled = true;
    utils.getElementsByClass("wfid_sim_build")[0].disabled = false;
  }
 
/*--public--------------------------------------------------------------------*/

  that.offsetX = obj ? obj.offsetX : 30;
  that.offsetY = obj ? obj.offsetY : 30;
  init();

  // net elements constructors
  that.constructors = {};

  // place constructor
  that.constructors['place'] = function (obj)
  {
    var identity = genIdentity(obj);
    //console.log("construct place", obj);
    var ele = new fabric.Place({ 
      id: identity.id,
      markers: obj.markers, 
      strokeWidth: strokeWidth, 
      radius: pR, 
      stroke: stroke, 
      fill: fill, 
      top: obj.y, 
      left: obj.x,
      capacity: obj.capacity || 'inf',
      name: identity.name,
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
    var identity, transition, priority;

    identity = genIdentity(obj);
    
    priority = new fabric.Property({
      left: mR,
      top: pR,
      value: obj.priority || 1, 
      stroke: stroke, 
      fill: fill,
      height: 12,
      border: true,
      ctx: canvas.getContext()
    });

    transition = new fabric.Transition({
      id: identity.id,
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
      name: identity.name,
      beta: obj.angle || 0,
      priority: obj.priority || 1,
      delay: obj.delay || 1,
      priorityDisplay: priority
    });
    
    return transition;
  };

  // arc constructor
  that.constructors['arc'] = function (obj)
  {
    //console.log("construct arc", obj);
    var p1, p2, arrow, from, to, owner, weight;
    var identity = genIdentity(obj);
    
    // init grip point with its owner if exist or coords from mouse
    if (obj.from)
    {
      owner = that.findByName(obj.from);
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
      owner = that.findByName(obj.to);
      p2 = new fabric.ArrowPoint({ belongsTo: owner, end: 'to' });
      //console.log("bbbb!",obj.to, p1, owner);
    }
    else
    {
      p2 = new fabric.ArrowPoint({ left: mousePos.x + 20, top: mousePos.y + 20, end: 'to' });
    }
    
    weight = new fabric.Property({
      left: 0,
      top: 0,
      value: obj.weight || 1, 
      stroke: stroke,
      fill: fill,
      height: 12,
      ctx: canvas.getContext()
    });
    
    // create arrow and its handles
    arrow = new fabric.Arrow({
      id: identity.id,
      strokeWidth: that.strokeWidth,
      from: p1,
      to: p2,
      border: false, 
      element: obj.element,
      weight: obj.weight || 1,
      name: identity.name,
      weightDisplay: weight
    });
    
    return [p1, p2];//, arrow];
  };
  
  // set whole net
  that.set = function (ele_array)
  { 
    var i;
    
    // sort to make sure that places and transitions will be added before arcs, otherwise relations could be broken
    var sf = function(a, b)
    {
      if (a.element === "place" || a.element === "transition")
      {
        if (b.element === "place" || b.element === "transition")
        {
          return 0;
        }
        else
        {
          return -1;
        }
      }
      else if (b.element === "arc")
      {
        return 0;
      }
      else
      {
        return 1;
      }
    };
    ele_array.sort(sf);

    canvas.items = [];
    for (i = 0; i < ele_array.length; i++)
    {
      that.add(ele_array[i]);
    }
    /*var iterate = canvas.getObjects(), j;
    for (j = 0; j < iterate.length; j++)
    {
      console.log(iterate[j]);
    }*/
  };
  
  that.start = function (obj)
  {
    canvas.clear();
    that.set(obj.elements);
    //that.renderAll;
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
    return undefined;
  };

  that.findBy = function (attribute, value)
  {
    var i, array = canvas.getObjects();
    for (i = 0; i < array.length; i++)
    {
      //console.log(attribute, (array[i])[attribute]);
      //console.log((array[i])[attribute], value);
      if ((array[i])[attribute] === value)
      {
        return array[i];
      }
    }
    return undefined;
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
    //console.log(ele);
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
    var i, json,
    elements = [],
    all = canvas.getObjects();
    //console.log(all);
    //console.log("łotot");
    //alert("  that.toJSON = function()");
    // convert net data to JON
    for (i = 0; i < all.length; i++)
    {
      //console.log(all[i]);
      json = all[i].toJSON();
      //console.log(json);
      elements.push(json);
    }
    //console.log(canvas.toJSON());
    //console.log(elements);
    // save it in hidden field
    utils.getElementsByClass("wfid_net_data")[0].value = $.toJSON(elements);
  };
  
  that.clean = function ()
  {
    canvas.clear();
  };
  
  //--------------------------buttons & menus--------------------------------
  that.menu = {};
  that.menu.selectedObject = "button-cursor";
  that.menu.selectedMenu = null;
  that.menu.setSelected = function (obj)
  {
    that.menu.selectedObject = obj;
    if (obj !== "button-cursor" && obj !== 'button-marker' && obj !== "button-delete")
    {
      // turn on object selection
      canvas.objectSelection = false;
    }
    else 
    {
      // turn off selection
      canvas.objectSelection = true;    
    }
  };
  
  that.menu.change = function (Name)
  {
    that.menu.selectedMenu = Name;
  };
  
  
  that.buttonBuild = function ()
  {
    var buttons, i, objs = canvas.getObjects();
    that.toJSON();
    for (i = 0; i < objs.length; i++)
    {
      objs[i].selectable = false;
    }
    buttons = utils.getElementsByClass("sim_button");
    buttons[0].disabled = false;
    buttons[1].disabled = false;
    buttons[2].disabled = false;
    buttons[3].disabled = false;
    utils.getElementsByClass("wfid_sim_build")[0].disabled = true;
  };
  
  that.buttonPlay = function ()
  {
  
  };
  
  that.buttonPause = function ()
  {
  
  };
  
  that.buttonStop = function ()
  {
    var keys, buttons, i, objs = canvas.getObjects();
    for (i = 0; i < objs.length; i++)
    {
      objs[i].selectable = true;
    }
    buttons = utils.getElementsByClass("sim_button");
    buttons[0].disabled = true;
    buttons[1].disabled = true;
    buttons[2].disabled = true;
    buttons[3].disabled = true;
    utils.getElementsByClass("wfid_sim_build")[0].disabled = false;    
    
    // every element of happenings obj should be cleared here with clearTimeout()
    /*keys = happenings.keys();
    for (i = 0; i < keys.length; i++)
    {
      clearTimeout(happenings[keys[i]].handle);
    }*/
  };
  // --------------------simulation-------------------------------------------

  that.happenings = {};
  
  // data.id - id of transition to launch
  // data.changes - list of places with amounts of markers to move after launching  
  that.scheduleTransition = function (data)
  {
    alert(data);
    var handle,
      transition = that.findBy('id', data.id);

    //console.log(canvas.getObjects());
    //console.log(transition);
    transition.start();
    canvas.renderAll();
    //console.log('that.launchTransition(' + data.id + ')');
    //setTimeout('console.log("where am I? ", this)', simulationSpeed);
    handle = setTimeout(function ()
                        {
                          that.launchTransition(data.id)
                        }, simulationSpeed);

    that.happenings[data.id] = {
      handle: handle,
      transition: transition,
      changes: data.changes
    };
  };
  
  that.launchTransition = function (id)
  {
    console.log("launchTransition: ", id);
    var i, place,
      hap = that.happenings[id],
      ch = hap.changes,
      length = hap.changes.length;

    that.happenings[id] = undefined;
    hap.transition.finish();
    console.log(hap);
    for (i = 0; i < length; i++)
    {
      place = that.findBy('id', ch[i].id);
      console.log(place);
      place.transfer(ch[i].amount);
    }
    canvas.renderAll();
  };
  
  return that;
}; // end of function net_constructor
