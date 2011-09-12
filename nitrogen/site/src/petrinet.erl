%% -*- mode: nitrogen -*-
-module (petrinet).
-compile(export_all).
-include_lib("nitrogen/include/wf.hrl").
-include("records.hrl").

main() -> #template { file = "./site/templates/petrinet.html" }.

title() -> "Petri Nets".

body() -> 
  {Menu, Actions} = menu(net),
  wf:wire(Actions),
  [
    #panel { id = "app", body = 
    [
      #panel { id = "menus", body = 
      [
        #panel { id = controls, body = "<p id=\"feedback\"><label id=\"feed\">(0, 0)</label></p>" },
        #dropdown { id = menu_drop, postback = menu_select, options = 
        [
          #option { text = "Sieć", value = "net" },
          #option { text = "Elementy", value = "elements" },
          #option { text = "Właściwości", value = "properties" }
        ]},
        #panel { id = menu_items, body = Menu }
      ]},
      
      #panel { id = "editor", body = "<canvas id=\"canvas\"></canvas>" }
    ]}
  ].


%%% various event handlers

event(menu_select) ->
  wf:wire(#script { script = "petri.menu.setSelected(\"button-cursor\");" }),
  Menu_name = wf:q(menu_drop),
  case menu(list_to_atom(Menu_name)) of
    {Menu, Actions} ->
      wf:update(menu_items, Menu),
      wf:wire(Actions);
    Menu ->
      wf:update(menu_items, Menu)
  end,
  ChangeMenu = wf:f("petri.menu.change(\"~s\");", [Menu_name]),
  io:format(ChangeMenu),
  wf:wire(#script { script = ChangeMenu }),
  ok;
event(save_to_file) ->
  io:format("got save_to_file postback:~n"),
  Data = wf:q(save_to_file_data),
  Text = wf:f("~p~n", [Data]),
  
  Res = mochijson2:decode(Data),
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
  % old parser
  %{ok, Parsed} = petrijson:parse(scanner:tokenize(LocalFileData)),
  
  % new parser
  {ok, Parsed1} = parser2:parse(scanner2:tokenize(LocalFileData)),
  Parsed = {struct,[{elements, Parsed1}]},

  %io:format("parsed~p~n", [Parsed]),
  JSONed = mochijson2:encode(Parsed),
  %io:format("got net data~n"),

  % execute js script with data
  io:format("~s~n", [JSONed]),
  Script = wf:f("petri.start(~s);", [JSONed]),
  wf:wire(#script { script = Script }),
  io:format("lauched js script~n"),
  ok.

%% menu context generators
menu(net) ->
  Menu = [
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
  Actions = 
  [
    #event { trigger = new_net, type = click, actions = #script { script = "petri.clean();" } },
    #event { trigger = save_to_file, type = click, actions =
    [
      #script { script = ToJSON },
      #event { postback = save_to_file }
    ]}
  ],
  {Menu, Actions};
menu(elements) ->
  Menu = [
    "<label class=\"menu_description\">Aby dodać element zaznacz, a następnie kliknij w polu edytora.</label>",
    "<ol id=\"selectable\">
	    <li class=\"selected\" title=\"button-cursor\"><img alt=\"cursor\" src=\"images/cursor.png\" /></li>
	    <li title=\"button-delete\"><img alt=\"delete\" src=\"images/delete.png\" /></li>
	    <li title=\"button-transition\"><img alt=\"transition\" src=\"images/transition.png\" /></div></li>
	    <li title=\"button-place\"><img alt=\"place\" src=\"images/place.png\" /></li>
	    <li title=\"button-arc\"><img alt=\"arc\" src=\"images/arc.png\" /></li>
	    <li title=\"button-marker\"><img alt=\"marker\" src=\"images/marker.png\" /></li>
    </ol>"
  ],
  {Menu, #script { script = "utils.selectable();" }};
menu(properties) ->
  Menu = [
    "<label class=\"menu_description\">Właściwości zaznaczonego elementu.</label>",
    "<div id=\"element_properties\"> </div>"
  ],
  Menu.
