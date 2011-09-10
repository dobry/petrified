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
      if (myclass.test(classes)) retnode.push(elem[i]);
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
        this.belongsTo.arcs.push(this); // TODO place|tranasition should be group instead of this
        this.left = this.belongsTo.left;
        this.top = this.belongsTo.top;
      }
      else
      {
        this.belongsTo = null;
      }
      console.log(this);
      this.width = this.height = 10;
      this.set('arrow', options.arrow || null);
    },

    _renderTo: function (ctx) { },
    _renderFrom: function (ctx)
    {
      this.arrow._render(ctx);
    },
    
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
          if (this.arrow) this.arrow.height = value - this.arrow.from.top || 1;
        }
        else if (property === 'left')
        {
          this.left = value;
          if (this.arrow) this.arrow.width = value - this.arrow.from.left || 1;
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
          }
        }
        else if (property === 'left')
        {
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
    }
  });
  
  fabric.ArrowPoint.ATTRIBUTE_NAMES = 'belongsTo arrow end'.split(' ');

  fabric.Arrow = fabric.util.createClass(fabric.Object, {
    
    type: 'arrow',
    selectable: false,
    hasControls: false,
    
    initialize: function (options)
    {
      var that = this;
      this.callSuper('initialize', options);

      //init arrow grabbable points
      this.from = options.from;
      this.from.arrow = this;
      this.to = options.to;
      this.to.arrow = this;
      this.top = that.from.top;
      this.left = that.from.left;
      this.width = that.to.left - that.from.left;
      this.height = that.to.top - that.from.top;
 
      this.element = options.element;
      this.name = options.name;
    },
    
    _render: function (ctx)
    {
      ctx.strokeStyle = 'rgb(0,0,0)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(this.width, this.height);
      ctx.stroke();
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
  });
  
})(typeof exports != 'undefined' ? exports : this);
