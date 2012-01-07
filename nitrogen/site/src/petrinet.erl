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
  
event(save_to_file) ->
  io:format("got save_to_file postback:~n"),
  Data = wf:q(save_to_file_data),
  Text = wf:f("~p~n", [Data]),
  
  Res = mochijson2:decode(Data),
  %io:format("Data:~n~p~n", [Data]),
  %io:format("Res:~n~p~n", [Res]),
  %Strings = printer:format(Res),
  
  case file:make_dir("./site/tmp/") of
    ok -> ok;
    {error, eexist} -> ok
  end,
  ok = file:set_cwd("./site/tmp/"),
  {ok, Device} = file:open("result", write),  
  
  io:format(Text),
  printer:print(Device, Res),
  file:close(Device),
  
  {ok, Dir} = file:get_cwd(),
  Ref = io_lib:format("file://~s/result", [Dir]),
  io:format("'~s'",[Ref]),
  wf:insert_bottom(menu_items, "<a href=\"result\">Wygenerowany plik</a>" ),%Ref }),
  ok = file:set_cwd("../../"),
  ok.  

drop_event(Drag_tag, canvas_drop) ->
  % execute js script with data
  Script = wf:f("petri.drop(\"~p\");", [Drag_tag]),
  wf:wire(#script { script = Script }),
  io:format("lauched js script:~n~s~n", [Script]),
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
      NewFeed = wf:f("Error: Line:~p Reason:~p", [Line_number, Reason]),
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
      #br {},
      #button { text = "Zapisz do pliku", id = save_to_file },
      #hidden { id = save_to_file_data },
      #br {},#br {},
      #button { text = "Wyczyść", id = new_net }
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
  ToJSON = wf:f("petri.toJSON();"),
  Actions = 
  [
    #event { trigger = new_net, type = click, actions = #script { script = "petri.clean();" } },
    #event { trigger = save_to_file, type = click, actions =
    [
      #script { script = ToJSON },
      #event { postback = save_to_file }
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
