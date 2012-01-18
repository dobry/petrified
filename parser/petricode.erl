-module(petricode).
-export([print/2, interpret/1]).

print(Device, [Obj | List])->
  {struct, Attributes} = Obj,
  case struct(Attributes, undefined, []) of
    no_element -> ok;
    Result -> printObj(Device, Result)
  end,
  % print result
  print(Device, List);
print(_Device, []) ->
  ok.

%% format object
struct([], undefined, []) ->
  no_element;
struct([Attr | List], Element, AttrStrings) ->
  case desirable(Attr) of
    false ->
      struct(List, Element, AttrStrings);
    {element, NewElement} ->
      struct(List, NewElement, AttrStrings);
    AttrString ->
      struct(List, Element, [AttrString | AttrStrings])
  end;
struct([], Element, AttrStrings) ->
  {Element, AttrStrings}.
  % format element
  % add Strings
  % format end of element
  

%% parse attribute
attr({Name, Value}) when is_binary(Value) ->
  case binary_to_atom(Name, utf8) of
    element ->
      {element, binary_to_list(Value)};
    _Any ->
      io_lib:format("~s ~s", [binary_to_list(Name), binary_to_list(Value)])
  end;
attr({Name, Value}) ->
  io_lib:format("~s ~p", [binary_to_list(Name), Value]).

printObj(Device, {Element, AttrStrings}) ->
  io:fwrite(Device, "~s~n", [Element]),
  printAttr(Device, AttrStrings),
  io:fwrite(Device, "~s~n", ["end"]),
  ok.

printAttr(Device, [Attr | Attrs]) ->
  io:fwrite(Device, "  ~s~n", [Attr]),
  printAttr(Device, Attrs);
printAttr(_, []) ->
  ok.

desirable({Name, Value}) ->
  List = [
    <<"x">>,
    <<"y">>,
    <<"name">>,
    <<"weight">>,
    <<"priority">>,
    <<"to">>,
    <<"from">>,
    <<"markers">>,
    <<"delay">>,
    <<"angle">>,
    <<"element">>
  ],
  case lists:any(fun (El) -> Name == El end, List) of
    true -> attr({Name, Value});
    _ -> false
  end.

interpret(LocalFileData) ->
  % prepare net data
  case scanner:tokenize(LocalFileData) of
    {error, Line_number, Reason} ->
      NewFeed = wf:f("Error: Line:~p Reason:~s", [Line_number, Reason]),
      io:format("Error: Line:~p Reason:~s", [Line_number, Reason]),
      wf:update(feed, NewFeed);
    Scanned ->
      % new parser
      parser:parse(Scanned)  
  end.

