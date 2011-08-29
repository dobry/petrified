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
      #panel { id = "menus", body = 
        #dropdown { id = menu_drop, postback = menu_select, options = 
        [
          #option { text = "Pliki", value = "files" },
          #option { text = "Elementy", value = "elements" }
        ]}},
      #panel { id = "editor", body = "
        <canvas id=\"canvas\"></canvas>
      " }
    ]}
  ].

event(menu_select) ->
  Menu = wf:q(menu_drop),
  wf:flash("You opened menu " ++ Menu ++ ".").
