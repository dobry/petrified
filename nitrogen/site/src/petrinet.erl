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
  io:format("~p~n", [Data]),
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
    %"<input value=\"Wyczyść\" type=\"button\" onclick=\"petri.clean();\" />"
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
	    <li class=\"selected\" title=\"button-cursor\"><div class=\"button-cursor\"></div></li>
	    <li title=\"button-transition\"><div class=\"button-transition\"></div></li>
	    <li title=\"button-place\"><div class=\"button-place\"></div></li>
	    <li title=\"button-arc\"><div class=\"button-arc\"></div></li>
	    <li title=\"button-marker\"><div id=\"floater\"><div id=\"content\"><div class=\"button-marker\"></div></div></div></li>
    </ol>"
  ],
  {Menu, #script { script = "utils.selectable();" }};
menu(properties) ->
  Menu = [
    "<label class=\"menu_description\">Właściwości zaznaczonego elementu.</label>",
    "<div id=\"element_properties\"> </div>"
  ],
  Menu.
