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
      $( "#select-result" ).empty().append($(this).context.title);
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
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    hasControls: false,
    
    initialize: function(options) {
      this.set('arrow', options.arrow || null);
      this.set('end', options.end || null);
      this.callSuper('initialize', options);
    },

    _render: function(ctx) {
    },
    
    complexity: function() {
      return 1;
    },
  });
  
  fabric.ArrowPoint.ATTRIBUTE_NAMES = 'belongsTo arrow end'.split(' ');
  

  if (fabric.ArrowFace) {
    return;
  }

  fabric.ArrowFace = fabric.util.createClass(fabric.Object, {
    
    type: 'arrow_face',
    hasControls: false,
    
    initialize: function(options) {
    },

    _render: function(ctx) {
    },
    
    complexity: function() {
      return 1;
    },
  });
  
  fabric.ArrowFace.ATTRIBUTE_NAMES = 'belongsTo arrow end'.split(' ');
  

  if (fabric.Arc) {
    return;
  }

  fabric.Arc = fabric.util.createClass(fabric.Object, {
    
    initialize: function(options) {
    },

    _render: function(ctx) {
    },
    
    complexity: function() {
      return 1;
    },
  });
  
  fabric.Arc.ATTRIBUTE_NAMES = ''.split(' ');
  
})(typeof exports != 'undefined' ? exports : this);
