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
      #panel { id = "floating_messages", body =
      [
        #hidden { id = "receiver" },
        #flash {}
      ] },
      #panel { id = "menus", body = 
      [
        #dropdown { id = menu_drop, postback = menu_select, options = 
        [
          #option { text = "Pliki", value = "files" },
          #option { text = "Elementy", value = "elements" },
          #option { text = "Właściwości", value = "properties" }
        ]},
        #panel { id = menu_items, body = menu(files) }
      ]},
        
      #droppable {
        tag = canvas_drop,
        accept_groups = menu_elements,
        body = #panel { id = "editor", body = "
          <canvas id=\"canvas\"></canvas>
        " }
      }
    ]}
  ].


%%% various event handlers

event(menu_select) ->
  Menu_name = wf:q(menu_drop),
  Menu = menu(list_to_atom(Menu_name)),
  wf:update(menu_items, Menu),
  ok.

drop_event(Drag_tag, canvas_drop) ->
  Message = wf:f("Dropped ~p on canvas.", [Drag_tag]),
  wf:flash(Message),
  ok.

start_upload_event(myUpload1) ->
  fading_flash("Upload started.").

finish_upload_event(_Tag, undefined, _, _) ->
  fading_flash("Please select a file."),
  ok;

finish_upload_event(_Tag, _FileName, LocalFileData, Node) ->
  FileSize = filelib:file_size(LocalFileData),
  fading_flash(wf:f("Uploaded file: ~s (~p bytes) on node ~s.~nParsing...", [LocalFileData, FileSize, Node])),
  io:format("uploaded~n"),
  
  % prepare net data
  {ok, Parsed} = petrijson:parse(scanner:tokenize(LocalFileData)),
  %io:format("parsed~p", [Parsed]),
  JSONed = mochijson2:encode(Parsed),
  io:format("got net data~n"),

  % execute js script with data
  %io:format("~s~n", [JSONed]),
  Script = wf:f("petri.start(~s);", [JSONed]),
  wf:wire(#script { script = Script }),
  io:format("lauched js script~n"),
  ok.


%%% module helpers

fading_flash(Msg) ->
  Id = wf:temp_id(),
  Ele = #label { id = Id, text = Msg },
  %wf:wire(Id, #event{type='timer', delay=1000, actions=#hide{effect=blind, target=Id}}),
  %wf:wire(Ele, #effect { effect = slide, speed = 1000, options=[{direction,"up"}, {mode, hide}]}),
  wf:flash(Ele).

%% menu context generators
menu(files) ->
  [
    "Wczytaj plik",
    #br {},
    #upload { class = upload_field, tag = myUpload1, show_button = false }
  ];
menu(elements) ->
  [
    "Dodawaj elementy przeciągając je do edytora.",
    #draggable
    {
      tag = place_drag,
      group = menu_elements,
      clone = true,
      revert = false, % element comes back to initial place 
      body = #image { image = "/images/place.png" } 
    },
    #draggable
    {
      tag = transition_drag,
      group = menu_elements,
      clone = true,
      revert = false,
      body = #image { image = "/images/transition.png" }
    }
  ];
menu(properties) ->
  [
    "Właściwości zaznaczonego elementu."
  ].
