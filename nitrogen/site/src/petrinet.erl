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
          #option { text = "Elementy", value = "elements" }
        ]},
        #panel { id = menu_items, body = menu(files) }
      ]},
        
      #panel { id = "editor", body = "
        <canvas id=\"canvas\"></canvas>
      " }
    ]}
  ].

event(menu_select) ->
  Menu_name = wf:q(menu_drop),
  wf:flash("You opened menu " ++ Menu_name ++ "."),
  Menu = menu(list_to_atom(Menu_name)),
  wf:update(menu_items, Menu).


%% menu context generators
menu(files) ->
  [
    "Wczytaj plik",
    #br {},
    #upload { class = upload_field, tag = myUpload1, show_button = false }
  ];
menu(elements) ->
  [
    "Dodawaj elementy przeciągając je do edytora."
  ].


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

fading_flash(Msg) ->
  Id = wf:temp_id(),
  Ele = #label { id = Id, text = Msg },
  %wf:wire(Id, #event{type='timer', delay=1000, actions=#hide{effect=blind, target=Id}}),
  %wf:wire(Ele, #effect { effect = slide, speed = 1000, options=[{direction,"up"}, {mode, hide}]}),
  wf:flash(Ele).
