function pr(str)
{
  document.write(str + "<br />");
};

function test()
{
  var obj = 
  {"elements":[
    {"type":"place","name":"p0","x":100,"y":100,"markers":1},
    {"type":"place","name":"p1","x":200,"y":100,"markers":1},
    {"type":"place","name":"p2","x":100,"y":200,"markers":1},
    //{"type":"transition","name":"t0","x":150,"y":100,"w":1,"delay":1.504},
    {"type":"transition","name":"t1","x":150,"y":150,"w":3,"delay":1.1},
    {"type":"transition","name":"t2","x":100,"y":150,"w":2,"delay":2.5}
    /*{"type":"arc","name":"a0","from":"p0","to":"t0"},
    {"type":"arc","name":"a1","from":"t0","to":"p1"},
    {"type":"arc","name":"a2","from":"p1","to":"t1"},
    {"type":"arc","name":"a3","from":"t1","to":"p2"},
    {"type":"arc","name":"a4","from":"p2","to":"t2"},
    {"type":"arc","name":"a5","from":"t2","to":"p0"}*/
  ]};
  /*{ "elements":
  [
    {
      "type":"place",
      "name":"wybitnie",
      "x":50,
      "y":50,
      "markers":1
    },
    {
      "type":"transition",
      "name":"ciekawe",
      "x":100,
      "y":70,
      "w":1,
      "delay":1.504
    },
    {
      "type":"arc",
      "name":"nazwy",
      "from":"wybitnie",
      "to":"ciekawe"
    }
  ]};*/
  
  // initiate petri net
  var petri = net.net_constructor({offsetX: 10, offsetY: 10});
  var ele;
  
  
  petri.start(obj);
  
  // find #3 element
  //ele = petri.get(obj.elements[2].name);
  
  // testuj inicjalizację punktu startowego i końcowego łuku
  /*if (ele)
  {
    pr("ele.type: " + ele.type);
    pr("ele.from.name: " + ele.from.name);
    pr("ele.from.arcs[0].name: " + ele.from.arcs[0].name);
    pr("ele.to.name: " + ele.to.name);
    pr("ele.to.arcs[0].name: " + ele.to.arcs[0].name);
  }*/
  /*if (ele)
  {
    pr("ele.from.x: " + ele.from.x);
    pr("ele.from.y: " + ele.from.y);
    pr("ele.to.x: " + ele.to.x);
    pr("ele.to.y: " + ele.to.y);
  }*/
  
  // drop test
  //pr("droppped " + petri.drop("transition"));
  //petri.drop("place");
  //pr(petri.getPosition());
  
  petri.set_mouse_pos({x: 300, y: 400, fresh: true });
  petri.drop("place");
  //petri.set_mouse_pos({x: 700, y: 400, fresh: true });
  //petri.drop("transition");
};  
