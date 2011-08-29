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
      [
        #dropdown { id = menu_drop, postback = menu_select, options = 
        [
          #option { text = "Pliki", value = "files" },
          #option { text = "Elementy", value = "elements" }
        ]},
        #panel { id = menu_items, body = menu_files() }
      ]},
        
      #panel { id = "editor", body = "
        <canvas id=\"canvas\"></canvas>
      " }
    ]}
  ].

event(menu_select) ->
  Menu = wf:q(menu_drop),
  wf:flash("You opened menu " ++ Menu ++ ".").

% TODO make custom element of this function
menu_files() ->
  [
    "Wczytaj plik",
    #br {},
    #upload { tag = myUpload1, button_text = "Wczytaj plik" }
  ].

start_upload_event(myUpload1) ->
    wf:flash("Upload started.").

finish_upload_event(_Tag, undefined, _, _) ->
    wf:flash("Please select a file."),
    ok;

finish_upload_event(_Tag, FileName, LocalFileData, Node) ->
    FileSize = filelib:file_size(LocalFileData),
    wf:flash(wf:f("Uploaded file: ~s (~p bytes) on node ~s.", [FileName, FileSize, Node])),
    ok.

