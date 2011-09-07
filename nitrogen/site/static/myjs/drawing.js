var draw = function(ctx, style)
{
  this.ctx = ctx;
  this.style = style;
  this.markerR = 10; // marker radius
  this.placeR = 60; // place radius
};

draw.method('place', function(place)
{
  ctx.save();
  ctx.translate(place.x, place.y);
  ctx.strokeStyle = this.style;
  ctx.arc(0, 0, place.r, 0, Math.PI * 2, true);
  ctx.stroke();
  this.markers(place.markers);
  ctx.restore();
});

draw.method('transition', function(trans)
{
  ctx.save();
  ctx.translate(trans.x, trans.y);
  ctx.rotate(trans.angle);
  ctx.strokeStyle = this.style;  
  ctx.moveTo(0, -trans.l/2);
  ctx.lineTo(0, trans.l/2);
  ctx.restore();
});

draw.method('arc', function(arc)
{
  ctx.save();
  ctx.translate(arc.x0, arc.y0);
  ctx.StrokeStyle = this.style;
  ctx.lineTo(arc.x1, arc.x2);
  ctx.stroke();
  this.arrow();
  ctx.restore();
});

draw.method('markers', function(markers)
{
  this.markersPatern[markers];
});

// Define markers patern - way of printing depending on the amount of markers
draw.markersPatern[0] = function() {}
draw.markersPatern[1] = function()
{
  ctx.arc(0, 0, markerR)
}

// TODO rysowanie strzałki stycznej do łuku
draw.method('arrow', function()
{
  ctx.fillStyle = this.style;
  ctx.arc(0, 0, 10, 0, Math.PI * 2, true);
  ctx.fill();
});
