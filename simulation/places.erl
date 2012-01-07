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
      case lists:foldl(fun(E, Acc) -> check_place(E, Acc) end, {Dict, true}, Places) of %fun(E, Acc) -> check_places(E, Acc) end
        {_Dict, true} ->
          New_dict = lists:foldl(fun(E, Acc) -> update_place(E, Acc) end, Dict, Places),
          Pid ! ok_launch,
          loop(New_dict);
        {_Dict, false} ->
          Pid ! not_possible,
          loop(Dict)
      end
  end,
  ok.

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


%%% helpers for lists:foldl()

update_place({Id, Demand}, Dict) ->
  dict:update(Id, fun (P) ->
                    P#place{markers = P#place.markers - Demand}
                  end, Dict).

check_place(_E, {Dict, false}) ->
  {Dict, false};
check_place({Id, Demand}, {Dict, true}) -> 
  Val = dict:fetch(Id, Dict),
  if 
    Val#place.markers < Demand ->
      {Dict, false};
    true -> % else
      {Dict, true}
  end.
    

%%% public interface to Places process

%% check if places have enough markers for transition to launch
check(Places) ->
  places ! {check, Places, self()},
  receive
    Info -> Info
  end.
