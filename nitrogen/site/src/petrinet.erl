%% -*- mode: nitrogen -*-
-module (petrinet).
-compile(export_all).
-include_lib("nitrogen/include/wf.hrl").
-include("records.hrl").

main() -> #template { file = "./site/templates/petrinet.html" }.

title() -> "Petri Nets".

body() -> 
  [
    #panel { id = "app", body = [
      #panel { id = "floating_messages", body = #flash{} },
      #panel { id = "menus", body = "
        Menu<br />
        item1<br />
        item2<br />
        item3<br />
        item4<br />
        item5<br />
      " },
      #panel { id = "editor", body = "
        <canvas id=\"canvas\"></canvas>
      " }
    ]}
  ].
