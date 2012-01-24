-module(places).
-export([init/1, introduce_yourself/1, loop/1]).
-export([check/2]).
-include("net_records.hrl").

init({Places_List, Feed_Pid}) ->
  Dict = create_dict(Places_List),
  io:format("Dict: ~p~n", [Dict]),
  register(places, spawn(places, introduce_yourself, [{Dict, Feed_Pid}])),
  ok.

introduce_yourself(State) ->
  io:format("places ready ~p~n", [self()]),
  loop(State).

loop({Dict, Feed_Pid}) ->
  receive
    {check, Places, Pid, Tr_id} ->
      io:format("places: checking ~p, Places ~p~n", [Pid, Places]),
      {Response, New_dict} = check_places(Dict, Places),
      io:format("places: checked ~p, response ~p~n", [Pid, Response]),
      case Response of
        ok_launched ->
          Feed_Pid ! {ok_launched, Tr_id, Places};%petrinet:feed({ok_launched, Tr_id, Places});
        not_possible ->
          ok
      end,
      transition:send(Pid, Response),
      loop({New_dict, Feed_Pid});
    stop ->
      ok
  end.

create_dict(Elements_List) ->
  Map_fun = fun([{<<"id">>, Id} | Attr_List]) -> 
    [{<<"name">>, Name} | [{<<"x">>, Left} | [{<<"y">>, Top} | [{<<"markers">>, Mark} | [{<<"capacity">>, Cap} | []]]]]] = Attr_List,
    Cap1 = case Cap of
      <<"inf">> ->
        inf;
      Num ->
        Num
    end,
    {Id, #place {
      name = Name,
      left = Left,
      top = Top,
      markers = Mark,
      capacity = Cap1
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

%% Looks for Key == Id in Dict and applies Demand - modifies markers count for the place 
update_place({Id, Demand}, Dict) ->
  dict:update(Id, fun (P) -> P#place{markers = P#place.markers + Demand} end, Dict).

%% Looks for Key == Id in Dict, then checks if Demand for markers can be satisfied
check_place(_E, {Dict, false}) ->
  {Dict, false};
check_place({Id, Demand}, {Dict, true}) -> 
  Val = dict:fetch(Id, Dict),
  State = Val#place.markers + Demand,
  Bool = (State >= 0) and ((Val#place.capacity =:= inf) or (State =< Val#place.capacity)),
  io:format("Place id ~p: ~p, Demant: ~p, State: ~p, Bool: ~p~n",[Id, Val, Demand, State, Bool]),
  if 
    Bool ->
      {Dict, true};
    true -> % else
      {Dict, false}
  end.
    

%%% public interface to Places process

%% check if places have enough markers for transition to launch
check(Places, Id) ->
  places ! {check, Places, self(), Id},
  receive
    Info -> Info
  end.
