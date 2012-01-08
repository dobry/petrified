-module(places).
-export([init/1, loop/1]).
-export([check/1]).
-include("net_records.hrl").

init(Places_List) ->
  Dict = create_dict(Places_List),
  register(places, spawn(places, loop, [Dict])),
  ok.

loop(Dict) ->
  receive
    {check, Places, Pid} ->
      io:format("places: checking ~p~n", [Pid]),
      {Response, New_dict} = check_places(Dict, Places),
      io:format("places: checked ~p, response ~p~n", [Pid, Response]),
      Pid ! Response,
      loop(New_dict);
    stop ->
      ok
  end.

create_dict(Elements_List) ->
  Map_fun = fun([{<<"id">>, Id} | Attr_List]) -> 
    [{<<"name">>, Name} | [{<<"x">>, Left} | [{<<"y">>, Top} | [{<<"markers">>, Mark} | [{<<"capacity">>, Cap} | []]]]]] = Attr_List,
    {Id, #place {
      name = Name,
      left = Left,
      top = Top,
      markers = Mark,
      capacity = Cap
    }}
  end,
  KV = lists:map(Map_fun, Elements_List),
  dict:from_list(KV).


check_places(Dict, Places) ->
  case lists:foldl(fun(E, Acc) -> check_place(E, Acc) end, {Dict, true}, Places) of
    {_Dict, true} ->
      {ok_launched, lists:foldl(fun(E, Acc) -> update_place(E, Acc) end, Dict, Places)};
    {_Dict, false} ->
      {not_possible, Dict}
  end.


%%% helpers for lists:foldl()

update_place({Id, Demand}, Dict) ->
  dict:update(Id, fun (P) -> P#place{markers = P#place.markers + Demand} end, Dict).

check_place(_E, {Dict, false}) ->
  {Dict, false};
check_place({Id, Demand}, {Dict, true}) -> 
  Val = dict:fetch(Id, Dict),
  State = Val#place.markers + Demand,
  Bool = (State =< 0) or (State >= Val#place.capacity),
  %io:format("Place: ~p, Demant: ~p, State: ~p, Bool: ~p~n",[Val, Demand, State, Bool]),
  if 
    Bool ->
      {Dict, true};
    true -> % else
      {Dict, false}
  end.
    

%%% public interface to Places process

%% check if places have enough markers for transition to launch
check(Places) ->
  places ! {check, Places, self()},
  receive
    Info -> Info
  end.
