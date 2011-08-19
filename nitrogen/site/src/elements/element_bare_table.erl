%% -*- mode: nitrogen -*-
-module (element_bare_table).
-compile(export_all).
-include_lib("nitrogen/include/wf.hrl").
-include("records.hrl").

reflect() -> record_info(fields, element_bare_table).

render_element(#element_bare_table{}) ->
  TextboxID = wf:temp_id(),
  ButtonID = wf:temp_id(),
  wf:wire (ButtonID, #event {
    type = click,
    delegate = ?MODULE,
    postback = { click, TextboxID }
  }),
  [
    #textbox { id = TextboxID, text = "Your text...", next = ButtonID },
    #button { id = ButtonID, text = "Submit" }
  ].

event({click, TextboxID}) ->
  Text = wf:q(TextboxID),
  ?PRINT({clicked, TextboxID, Text}),
  PageModule = wf:page_module(),
  PageModule:bare_table_event(Text).
