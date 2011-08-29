%% -*- mode: nitrogen -*-
-module (index).
-compile(export_all).
-include_lib("nitrogen/include/wf.hrl").
-include("records.hrl").

main() -> #template { file = "./site/templates/bare.html" }.

title() -> "Petri Nets".

body() -> 
  [
    "<h1>Hello in Petri Nets editor</h1><br />
    <p><a href=\"./petrinet\">Click to try it</a></p>"
    
  ].
