//= require "object.class"

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
      ctx.beginPath();
    },
    
    complexity: function() {
      return 1;
    },
  });
  
  fabric.ArrowPoint.ATTRIBUTE_NAMES = 'arrow end'.split(' ');
  
})(typeof exports != 'undefined' ? exports : this);
