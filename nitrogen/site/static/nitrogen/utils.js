var utils = {
  is_array: function (value)
  {
    return Object.prototype.toString.apply(value) === '[object Array]';
  },
  
  getElementsByClass: function (cl)
  {
    var retnode = [];
    var myclass = new RegExp('\\b'+cl+'\\b');
    var elem = document.getElementsByTagName('*');
    for (var i = 0; i < elem.length; i++)
    {
      var classes = elem[i].className;
      if (myclass.test(classes))
      {
        retnode.push(elem[i]);
      }
    }
    return retnode;
  },
  
  selectable: function ()
  {
    $("#selectable li").click(function() {
      $(this).addClass("selected").siblings().removeClass("selected");
      petri.menu.setSelected($(this).context.title);
    });
  }
};

//= require "object.class"


// define ArrowPoint - point to manipulete arrow
(function(global){
  
  "use strict";
  
  var fabric = global.fabric || (global.fabric = { }),
      extend = fabric.util.object.extend,
      piBy2   = Math.PI * 2,
      toFixed = fabric.util.toFixed,
      min = fabric.util.array.min,
      max = fabric.util.array.max,
      invoke = fabric.util.array.invoke,
      removeFromArray = fabric.util.removeFromArray;
      
  if (fabric.ArrowPoint) {
    return;
  }

  fabric.ArrowPoint = fabric.util.createClass(fabric.Object, {
    
    type: 'arrow_point',
    hasControls: false,
    opacity: 1,
    
    initialize: function (options) {
      //console.log("arrowpoint!",options);
      this.set('end', options.end);
      if (options.end === 'to')
      {
        this.set = this._setTo;
        this._render = this._renderTo;
      }
      else if (options.end === 'from')
      {
        this.set = this._setFrom;
        this._render = this._renderFrom;
      }
      this.callSuper('initialize', options);
            
      if (options.belongsTo)
      {
        this.belongsTo = options.belongsTo;
        //console.log(this.belongsTo.name);
        this.belongsTo.add(this);
        this.left = this.belongsTo.left;
        this.top = this.belongsTo.top;
      }
      else
      {
        this.belongsTo = null;
      }
      //console.log(this);
      this.width = this.height = 10;
      this.set('arrow', options.arrow || null);
    },

    _renderTo: function (ctx)
    {
      //console.log("renderTo pos",this.get('left'), this.get('top'));
    },
    _renderFrom: function (ctx)
    {
      // why did i do that?
      //console.log("renderFrom pos",this.get('left'), this.get('top'));
      this.arrow._render(ctx);
    },

    toJSON: function ()
    {
      //console.log(this);
      if (this.end === 'from')
      {
        return {
          element: this.arrow.type,
          id: this.arrow.id,
          fromType: this.belongsTo ? this.belongsTo.type : 'undefined',
          name: this.arrow.name,
          fromId: this.belongsTo ? this.belongsTo.id : 'undefined',
          toId: this.arrow.to.belongsTo ? this.arrow.to.belongsTo.id : 'undefined',
          weight: this.weight || 1,
          from: this.belongsTo ? this.belongsTo.name : 'undefined',
          to: this.arrow.to.belongsTo ? this.arrow.to.belongsTo.name : 'undefined'
        };
      }
      else
      {
        return {};
      }
    },
/* BUG
  Strange behavior of arrow, when one of its points is selected in group select.
  The reason for that are coordinates of selected elements, which are set
  relative to group coordinates. Arrow takes then coords from its points and
  don't know that they are now in group scope.
  
  Posible solutions:
  -  disable group select
  -  add arrow to group created by selection
  -  set flag in point, when it's added to group and return point position acording to this flag
*/    
    _setTo: function(property, value) {
      var shouldConstrainValue = (property === 'scaleX' || property === 'scaleY') && value < this.MIN_SCALE_LIMIT;
      if (shouldConstrainValue) {
        value = this.MIN_SCALE_LIMIT;
      }
      if (typeof property == 'object') {
        for (var prop in property) {
          this.set(prop, property[prop]);
        }
      }
      else {
        if (property === 'angle') {
          this.setAngle(value);
        }
        else if (property === 'top')
        {
          this.top = value;
          //if (this.arrow) console.log("setTo arr.height", value - this.arrow.from.left || 1, "top", this.top);
          if (this.arrow)
          {
            this.arrow.height = value - this.arrow.from.top || 1;
          }
        }
        else if (property === 'left')
        {
          this.left = value;
          //if (this.arrow) console.log("setTo arr.width", value - this.arrow.from.left || 1, "left", this.left);
          if (this.arrow)
          {
            this.arrow.width = value - this.arrow.from.left || 1;
          }
        }
        else {
          this[property] = value;
        }
      }
      
      return this;
    },
    
    _setFrom: function(property, value) {
      var shouldConstrainValue = (property === 'scaleX' || property === 'scaleY') && value < this.MIN_SCALE_LIMIT;
      if (shouldConstrainValue) {
        value = this.MIN_SCALE_LIMIT;
      }
      if (typeof property == 'object') {
        for (var prop in property) {
          this.set(prop, property[prop]);
        }
      }
      else {
        if (property === 'angle') {
          this.setAngle(value);
        }
        else if (property === 'top')
        {
          this[property] = value;
          if (this.arrow)
          {
            this.arrow.top = value;
            this.arrow.height = this.arrow.to.top - value;
            //console.log("setFrom top", this.top, "arr.top", value, "arr.height", this.arrow.height);
          }
        }
        else if (property === 'left')
        {
          //console.log("setFrom left", this.left);
          this[property] = value;
          if (this.arrow)
          {
            this.arrow.left = value;
            this.arrow.width = this.arrow.to.left - value;
          }
        }
        else {
          this[property] = value;
        }
      }
      
      return this;
    },
    
    get: function (prop)
    {
      if (prop === 'element')
      {
        return this.arrow.element;
      }
      else if (prop === 'name')
      {
        return this.arrow.name;
      }
      else
      {
        return this[prop];
      }
      
    },
    
    setStroke: function (Stroke)
    {
      //this.arrow && 
      this.arrow.setStroke(Stroke); // try to set ony if arrow is defined
      //console.log(Stroke);
    },
    
    move: function (dir, val)
    {
      //console.log("f");
      this.set(dir, this.get(dir) + val);
    }
  }); //---------end of fabric.ArrowPoint---------
  
  fabric.ArrowPoint.ATTRIBUTE_NAMES = 'belongsTo arrow end'.split(' ');

  fabric.Arrow = fabric.util.createClass(fabric.Object, {
    
    type: 'arc',
    selectable: false,//true,
    //lockMovementX: true,
    //lockMovementY: true,
    hasControls: false,
    stroke: 'black',
    
    initialize: function (options)
    {
      //console.log("bonzaa!",options);
      this.callSuper('initialize', options);
      
      //init arrow grabbable points
      this.from = options.from;
      this.from.arrow = this;
      this.to = options.to;
      this.to.arrow = this;
      this.weight = options.weight || 1;
      
      this.top = this.from.top;
      this.left = this.from.left;
      this.width = this.to.left - this.from.left;
      this.height = this.to.top - this.from.top;
 
      this.strokeWidth = options.strokeWidth;
      this.weightDisplay = options.weightDisplay;
      this.element = options.element;
      this.name = options.name;
      this.id = options.id;
    },
    
    _render: function (ctx)
    {
      //console.log("render arrow");
      ctx.strokeStyle = this.stroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(this.width, this.height);
      ctx.stroke();
      if (this.weight > 1)
      {
        ctx.translate(this.width/2, this.height/2);
        this.weightDisplay.render(ctx);
        ctx.translate(-this.width/2, -this.height/2);
      }
      ctx.translate(this.width, this.height);
      ctx.rotate(this._calcAngle());
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(5, 20);
      ctx.moveTo(0, 0);
      ctx.lineTo(-5, 20);
      ctx.stroke();
    },
    
    _calcAngle: function ()
    {
      var angle = Math.atan(this.height / this.width);
      return this.width < 0 ? 3* Math.PI + angle + Math.PI/2 : angle + Math.PI/2;
    }
  }); //-----------end of fabric.Arrow---------

  fabric.Place = fabric.util.createClass(fabric.Object, {
    
    type: 'place',
    hasControls: false,
    //points: [],
    
    initialize: function (options)
    {
      //console.log("ahoj'", options);
      options = options || { };
      this.points = [];
      this.callSuper('initialize', options);
      this.set('radius', options.radius || 0);
      
      this.set('width', this.get('radius') * 2);
      this.set('height', this.get('radius') * 2);
      
      this.mR = options.mR;
      
      
      //console.log("cokolwiek");//,0utils.is_array(this.points));
      
      this.markers = options.markers || 0;
      this.element = options.element;
      this.name = options.name;
      this.id = options.id;
      this.capacity = options.capacity || 'inf';
    },
    
    
    _render: function(ctx, noTransform) {
      //console.log(this.points.length);
      ctx.beginPath();
      // multiply by currently set alpha (the one that was set by path group where this object is contained, for example)
      ctx.globalAlpha *= this.opacity;
      ctx.arc(noTransform ? this.left : 0, noTransform ? this.top : 0, this.radius, 0, piBy2, false);
      ctx.closePath();
      if (this.fill) {
        ctx.fill();
      }
      if (this.stroke) {
        ctx.stroke();
      }
      this._renderCapacity(ctx);
      this._renderMarkers(ctx);
    },
    
    _renderCapacity: function (ctx)
    {
      //console.log("in _renderCapacity; capacity: ", this.capacity);
      var width, height = 12, measure, padding = 1;
      if (this.capacity !== 'inf')
      {
        ctx.save();
        ctx.translate(-this.width/2, this.height/2);

        // calculate and print frame
        measure = ctx.measureText(this.capacity);
        width = measure.width;
        //console.log("capacity width: ", width);
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';//this.stroke;
        ctx.lineWidth = 0.7;
        ctx.fillRect(-padding, -height + padding, width + 2 * padding, height + 2 * padding);
        ctx.strokeRect(-padding, -height + padding, width + 2 * padding, height + 2 * padding);
        
        // print capacity
        ctx.fillStyle = 'black';
        ctx.font = height + 'px "Tahoma" bold';
        ctx.fillText(this.capacity, 0, 0);
        ctx.restore();
      }
    },

    _renderMarkers: function(ctx)
    {
      var i, pos,
        m = this.markers,
        angle;
      if (m < 1)
      {
        //console.log("nada markerro");
        return;
      }
      else if (m === 1)
      {
        //console.log("eine markeren");
        this._renderMarker(ctx);
      }
      else if (this.markers <= 6)
      {
        //console.log("viele markerren");
        //console.log(m);
        angle = (m ? piBy2 / m : 0);
        pos = this.radius/2;//(this.radius - 2 * this.mR) / 2;
        //console.log(angle, pos, m.length);
        for (i = 0; i < m; i++)
        {
            ctx.rotate(angle);
            ctx.translate(0, pos);
            this._renderMarker(ctx);
            ctx.translate(0, -pos);
        }
      }
      else
      {
        //console.log("więcej niż 6 markerów");
        this._renderMarker(ctx);        
        ctx.fillStyle = this.stroke;//'black';
        ctx.font = '24px "Tahoma"';
        ctx.fillText(this.markers, 0, 0); 
      }
    },
    
    _renderMarker: function (ctx)
    {
      //console.log(this.stroke);
      ctx.fillStyle = this.stroke;
      ctx.beginPath();
      ctx.arc(0, 0, this.mR, 0, piBy2, false);
      ctx.closePath();
      ctx.fill();
    },
    
    addMarker: function ()
    {
      this.markers++;
    },
    
    transfer: function (amount)
    {
      this.markers = this.markers + amount;
    },
    
    returnPoints: function ()
    {
      return this.points;
    },
    
    toJSON: function ()
    {
      //console.log(this);
      return {
        element: this.type,
        id: this.id,
        name: this.name,
        x: toFixed(this.left, this.NUM_FRACTION_DIGITS),
        y: toFixed(this.top, this.NUM_FRACTION_DIGITS),
        markers: this.markers,
        capacity: this.capacity
      };
    },
    
    add: function (ele)
    {
      //console.log(ele);
      this.points.push(ele);
    },
    
    remove: function (ele)
    {
      var i;
      //console.log("in remove place");
      for (i = 0; i < this.points.length; i++)
      {
        //console.log(ele, this.points[i]);
        if (this.points[i] === ele)
        {
          //console.log("removed", ele, this.points[i]);          
          this.points.splice(i, 1);
        }
      }
    },
    
    set: function (prop, val)
    {
      var i;
      if (prop === 'top')
      {
        for (i = 0; i < this.points.length; i++)
        {
          //console.log(val, this.points[i].top, this.top, val - this.top);
          this.points[i].move(prop, val - this.top);
          //console.log(val, this.points[i].top, this.top, val - this.top);
        }
        this.top = val;
      }
      else if (prop === 'left')
      {
        //console.log(this.points);
        for (i = 0; i < this.points.length; i++)
        {
          this.points[i].move(prop, val - this.left);
        }
        this.left = val;
      }
      else
      {
        this[prop] = val;
      }
    }
  }); // -----------end of fabric.Place----------
  
  fabric.Property = fabric.util.createClass(fabric.Object, {
    
    initialize: function (options)
    {
      options = options || {};
      this.callSuper('initialize', options);
      this.value = options.value;
      this.padding = options.padding || 1;
      this.ctx = options.ctx;
      this.width = this.ctx.measureText(this.value).width;
      this.height = options.height;
      this.border = options.border;
      this.theta = options.theta || 0;
      this.priority = options.priority || 1;
    },
    
    render: function (ctx, noTransform)
    {
      ctx.save();
      ctx.fillStyle = 'white';
      ctx.strokeStyle = this.stroke;
      ctx.lineWidth = 0.7;
      ctx.translate(-this.left, -this.top);
      ctx.rotate(-this.theta);
      ctx.clearRect(-this.padding, -this.height + this.padding, this.width + 2 * this.padding, this.height + 2 * this.padding);
      if (this.border === true)
      {
        ctx.strokeRect(-this.padding, -this.height + this.padding, this.width + 2 * this.padding, this.height + 2 * this.padding);
      }
      ctx.fillStyle = this.stroke;
      ctx.font = this.height + 'px "Tahoma" bold';
      ctx.fillText(this.value, 0, 0);
      ctx.restore();
    }
  }); // -----------end of fabric.Property-------
  
  fabric.Transition = fabric.util.createClass(fabric.Object, {
    
    type: 'transition',
    lockScalingX: true,
    lockScalingY: true,
    //points: [],
    
    initialize: function (options)
    {
      //console.log("ahoj'", options);
      options = options || { };

      //those attributes should be set before calling super.initialize() because it modifies them (uses this.set() method)
      this.points = [];
      this.priorityDisplay = options.priorityDisplay;
      
      this.callSuper('initialize', options);

      //console.log(options.beta);      
      this.beta = options.beta;
      this.angle = this.beta * Math.PI / 180;
      this.theta = this.beta / 180;
      this.set('priority', options.priority || 1);
      this.delay = options.delay;
      this.set('radius', options.radius || 0);      
      this.mR = options.mR;
      this.width = this.radius;
      
      this.element = options.element;
      this.name = options.name;
      this.id = options.id;
      //console.log("init Transition: ", this);
    },
    
    
    _render: function(ctx, noTransform) {
      ctx.beginPath();
      ctx.globalAlpha *= this.opacity;
      ctx.strokeStyle = this.stroke;
      ctx.fillStyle = this.fill;
      ctx.rect(-this.mR, -this.radius, this.mR * 2, this.height);
      ctx.closePath();
      if (this.fill) {
        ctx.fill();
      }
      if (this.stroke) {
        ctx.stroke();
      }
      if (this.priority > 1)
      {
        this.priorityDisplay.render(ctx);
      }
    },
    
    toJSON: function ()
    {
      //console.log("trans.angle", this.theta, this.angle, toFixed(this.angle * 180, this.NUM_FRACTION_DIGITS));
      //console.log(this);
      return {
        element: this.type,
        id: this.id,
        name: this.name,
        x: toFixed(this.left, this.NUM_FRACTION_DIGITS),
        y: toFixed(this.top, this.NUM_FRACTION_DIGITS),
        delay: this.delay,
        priority: this.priority || 1,
        angle: toFixed(this.theta * 180, this.NUM_FRACTION_DIGITS)
      };
    },    
    
    add: function (ele)
    {
      //console.log(ele);
      this.points.push(ele);
    },
    
    remove: function (ele)
    {
      var i;
      for (i = 0; i < this.points.length; i++)
      {
        if (this.points[i] === ele)
        {
          this.points.splice(i, 1);
        }
      }
    },
    
    set: function (prop, val)
    {
      var i;
      if (prop === 'priority')
      {
        this.priorityDisplay.value = val;
        this.priority = val;
      }
      else if (prop === 'top')
      {
        for (i = 0; i < this.points.length; i++)
        {
          //console.log(val, this.points[i].top, this.top, val - this.top);
          this.points[i].move(prop, val - this.top);
          //console.log(val, this.points[i].top, this.top, val - this.top);
        }

        this.top = val;
      }
      else if (prop === 'left')
      {
        //console.log(this.points);
        for (i = 0; i < this.points.length; i++)
        {
          this.points[i].move(prop, val - this.left);
        }
        this.left = val;
      }
      else if (prop === 'theta')
      {
        this.priorityDisplay.theta = val;
        this.theta = val;
      }
      else
      {
        this[prop] = val;
      }
    }
  }); //-----------end of fabric.Transition---------
  
})(typeof exports != 'undefined' ? exports : this);
