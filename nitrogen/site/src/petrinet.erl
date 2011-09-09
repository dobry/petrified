%% -*- mode: nitrogen -*-
-module (petrinet).
-compile(export_all).
-include_lib("nitrogen/include/wf.hrl").
-include("records.hrl").

main() -> #template { file = "./site/templates/petrinet.html" }.

title() -> "Petri Nets".

body() -> 
  [
    #panel { id = "app", body = 
    [
      #panel { id = "floating_messages", body =
      [
        #hidden { id = "receiver" },
        #flash {}
      ] },
      #panel { id = "menus", body = 
      [
        #panel { id = controls, body = "<label id=\"feed\">(0, 0)</label>" },
        #dropdown { id = menu_drop, postback = menu_select, options = 
        [
          #option { text = "Pliki", value = "files" },
          #option { text = "Elementy", value = "elements" },
          #option { text = "Właściwości", value = "properties" }
        ]},
        #panel { id = menu_items, body = menu(files) }
      ]},
      
      #panel { id = "editor", body = #droppable
      {
        tag = canvas_drop,
        accept_groups = menu_elements,
        body = "<canvas id=\"canvas\"></canvas>" }
      }
    ]}
  ].


%%% various event handlers

event(menu_select) ->
  Menu_name = wf:q(menu_drop),
  Menu = menu(list_to_atom(Menu_name)),
  wf:update(menu_items, Menu),
  ok;
event(save_to_file) ->
  io:format("got save_to_file postback:~n"),
  Data = wf:q(save_to_file_data),
  io:format("~p~n", [Data]),
  ok.  

drop_event(Drag_tag, canvas_drop) ->
  %Message = wf:f("Dropped ~p on canvas.", [Drag_tag]),
  %wf:flash(Message),
  % execute js script with data
  Script = wf:f("petri.drop(\"~p\");", [Drag_tag]),
  wf:wire(#script { script = Script }),
  io:format("lauched js script:~n~s~n", [Script]),
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
  io:format("parsed~p~n", [Parsed]),
  JSONed = mochijson2:encode(Parsed),
  io:format("got net data~n"),

  % execute js script with data
  io:format("~s~n", [JSONed]),
  Script = wf:f("petri.start(~s);", [JSONed]),
  wf:wire(#script { script = Script }),
  io:format("lauched js script~n"),
  ok.


%%% module helpers

fading_flash(_Msg) ->
  %Id = wf:temp_id(),
  %Ele = #label { id = Id, text = Msg },
  %wf:wire(Id, #event{type='timer', delay=1000, actions=#hide{effect=blind, target=Id}}),
  %wf:wire(Ele, #effect { effect = slide, speed = 1000, options=[{direction,"up"}, {mode, hide}]}),
  %wf:flash(Ele).
  ok.

%% menu context generators
menu(files) ->
  Menu = [
    #br {},
    "Wczytaj z pliku",
    #br {},
    #upload { class = upload_field, tag = myUpload1, show_button = false },
    #br {},
    #button { text = "Zapisz do pliku", id = save_to_file },
    #hidden { id = save_to_file_data },
    #br {},#br {},
    #button { text = "Wyczyść", id = new_net }
  ],
  ToJSON = wf:f("petri.toJSON();"),
  wf:wire(save_to_file, #event { type = click, actions =
  [
    #script { script = ToJSON },
    #event { postback = save_to_file }
  ]}),
  NewNet = wf:f("petri.clean();"),
  wf:wire(new_net, #event { type = click, actions = #script { script = NewNet } }),
  Menu;
menu(elements) ->
  [
    "Dodawaj elementy przeciągając je do edytora.",
    #draggable
    {
      class = menu_item,
      tag = transition,
      group = menu_elements,
      clone = true,
      revert = false,
      body = "<div class=\"element transition\"></div>"
      %body = #image { image = "/images/transition.png" }
    },
    #draggable
    {
      class = menu_item,
      tag = place,
      group = menu_elements,
      clone = true,
      revert = false, % element comes back to initial place 
      %body = "<div class=\"element transition\"></div>"
      body = "<div class=\"element place\"></div>"
      %body = #image { image = "/images/transition.png" }
      %body = #image { image = "/images/place.png" } 
    }
  ];
menu(properties) ->
  [
    "Właściwości zaznaczonego elementu.",
    "<div id=\"element_properties\"> </div>"
  ].
