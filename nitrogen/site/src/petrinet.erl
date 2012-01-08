%% -*- mode: nitrogen -*-
-module (petrinet).
-compile(export_all).
-include_lib("nitrogen/include/wf.hrl").
-include("records.hrl").

main() -> #template { file = "./site/templates/petrinet.html" }.

title() -> "Petri Nets".

body() -> 
  {Menu, Actions} = menu(edit),
  wf:wire(Actions),
  [
    #panel { id = "app", body = 
    [
      #panel { id = "menus", body = 
      [
        #panel { id = controls, body = "<p id=\"feedback\"><label id=\"feed\">(0, 0)</label></p>" },
        #panel { id = menu_items, body = Menu }
      ]},
      
      #panel { id = "editor", body = "<canvas id=\"canvas\"></canvas>" }
    ]},
    #panel { id = feed, body = " " }
  ].


%%% event handlers
%event(init_simulation) ->
%  Data = wf:q(net_data),
event(save_to_file) ->
  io:format("got save_to_file postback:~n"),
  Data = wf:q(net_data),
  generate:to_file(Data);
%% simulation GUI events
event(sim_build) ->
  io:format("sim_build event~n"),
  JSON = wf:q(net_data),
  List = mochijson2:decode(JSON),
  %io:format("~p~n", [JSON]),
  %io:format("~p~n", [List]),
  simulation:init(List),
  ok;
event(sim_play) ->
  %io:format("sim_play event~n"),
  simulation:play();
event(sim_pause) ->
  %io:format("sim_pause event~n"),
  simulation:pause();
event(sim_stop) ->
  %io:format("sim_stop event~n"),
  simulation:stop().

drop_event(Drag_tag, canvas_drop) ->
  % execute js script with data
  Script = wf:f("petri.drop(\"~p\");", [Drag_tag]),
  wf:wire(#script { script = Script }),
  % io:format("lauched js script:~n~s~n", [Script]),
  ok.

start_upload_event(myUpload1) ->
  io:format("Upload started.").

finish_upload_event(_Tag, undefined, _, _) ->
  io:format("Please select a file."),
  ok;

finish_upload_event(_Tag, _FileName, LocalFileData, Node) ->
  FileSize = filelib:file_size(LocalFileData),
  io:format(wf:f("Uploaded file: ~s (~p bytes) on node ~s.~nParsing...", [LocalFileData, FileSize, Node])),
  io:format("Uploaded file: ~s (~p bytes) on node ~s.~nParsing...", [LocalFileData, FileSize, Node]),
  
  % prepare net data
  case scanner:tokenize(LocalFileData) of
    {error, Line_number, Reason} ->
      NewFeed = wf:f("Error: Line:~p Reason:~s", [Line_number, Reason]),
      io:format("Error: Line:~p Reason:~s", [Line_number, Reason]),
      wf:update(feed, NewFeed);
    Scanned ->
      % new parser
      case parser:parse(Scanned) of
        {ok, Parsed1} ->
          Parsed = {struct,[{elements, Parsed1}]},

          %io:format("parsed~p~n", [Parsed]),
          JSONed = mochijson2:encode(Parsed),
          %io:format("got net data~n"),

          % execute js script with data
          io:format("~s~n", [JSONed]),
          Script = wf:f("petri.start(~s);", [JSONed]),
          wf:wire(#script { script = Script }),
          io:format("lauched js script~n");
        {error, {Line_number, _Module, Message}} ->
          %Feed = wf:q(feed),
          NewFeed = wf:f("Error: Line: ~p Message: ~s", [Line_number, Message]),
          wf:update(feed, NewFeed)
      end
    end,
  ok.

%% menu context generators
menu(edit) ->
  Menu = [
    #panel { class = "menu", id = net, body = [
      "<label class=\"menu_description\">Wczytaj z pliku</label>",
      #br {},
      #upload { class = upload_field, tag = myUpload1, show_button = false },
      #hidden { id = net_data },
      #button { text = "Zapisz do pliku", id = save_to_file },
      #button { text = "Wyczyść", id = new_net },
      #br {},#br {},
      #button { text = "build", id = sim_build },
      #button { text = "play", id = sim_play },
      #button { text = "pause", id = sim_pause },
      #button { text = "stop", id = sim_stop }
    ]},
    #panel { class = "menu", id = elements, body = [
      "<label class=\"menu_description\">Aby dodać element zaznacz, a następnie kliknij w polu edytora.</label>
      <ol id=\"selectable\">
	      <li class=\"selected\" title=\"button-cursor\"><img alt=\"cursor\" src=\"images/cursor.png\" /></li>
	      <li title=\"button-delete\"><img alt=\"delete\" src=\"images/delete.png\" /></li>
	      <li title=\"button-transition\"><img alt=\"transition\" src=\"images/transition.png\" /></li>
	      <li title=\"button-place\"><img alt=\"place\" src=\"images/place.png\" /></li>
	      <li title=\"button-arc\"><img alt=\"arc\" src=\"images/arc.png\" /></li>
	      <li title=\"button-marker\"><img alt=\"marker\" src=\"images/marker.png\" /></li>
      </ol>"
    ]}
  ],
  Actions = 
  [
    #event { trigger = save_to_file, type = click, actions =
    [
      #script { script = wf:f("petri.toJSON();") },
      #event { postback = save_to_file }
    ]},
    #event { trigger = new_net, type = click, actions = #script { script = "petri.clean();" } },
    #event { trigger = sim_build, type = click, actions =
    [
      #script { script = wf:f("petri.toJSON();") },
      #event { postback = sim_build }
    ]},
    #event { trigger = sim_play, type = click, actions =
    [
      %#script { script = wf:f("petri.toJSON();") },
      #event { postback = sim_play }
    ]},
    #event { trigger = sim_pause, type = click, actions =
    [
      %#script { script = wf:f("petri.toJSON();") },
      #event { postback = sim_pause }
    ]},
    #event { trigger = sim_stop, type = click, actions =
    [
      %#script { script = wf:f("petri.toJSON();") },
      #event { postback = sim_stop }
    ]},
    #script { script = "utils.selectable();" }
  ],
  {Menu, Actions};
menu(properties) ->
  #panel { class = "menu", id = properties, body = [
    "<label class=\"menu_description\">Właściwości:</label>",
    #panel { id = element_properties, body = []}
    %<div id=\"element_properties\"> </div>"
  ]}.
