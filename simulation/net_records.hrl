-record(place,
{
  name,
  left = 0,
  top = 0,
  markers = 0,
  capacity = -1 % -1 means infinite capacity
}).

-record(transition,
{
  id,
  name,
  left = 0,
  top = 0,
  delay,
  arcs_to = [],
  arcs_from = []
}).
