-module(simulation).
-export([init/1, play/0, pause/0, stop/0]).
-export([build_simulation/1]).
-include("net_records.hrl").

init({List, Feed_Pid}) ->
  register(simulation, spawn(simulation, build_simulation, [{List, Feed_Pid}])).

build_simulation({List, Feed_Pid}) ->
  {ok, Places, Transitions, Arcs} = group_elements(List),
  %io:format("TT~pTT~n", [Res]),
  places:init({Places, Feed_Pid}),
  Pids = init_transitions(Transitions, Arcs),
  % init supervisor with Pids
  io:format("sim: ready ~p~n", [self()]),
  loop(Pids).

loop(Pids) ->
  receive
    play ->
      io:format("sim: play~n"),
      lists:foreach(fun ({_ID, Pid, _Priority}) -> Pid ! play end, Pids),
      loop(Pids);
    pause ->
      io:format("sim: pause~n"),
      lists:foreach(fun ({_ID, Pid, _Priority}) -> Pid ! pause end, Pids),
      loop(Pids);
    stop ->
      io:format("sim: stop~n"),
      lists:foreach(fun ({_ID, Pid, _Priority}) ->
                      io:format("stopping ~p~n", [Pid]),
                      Pid ! stop 
                    end, Pids),
      places ! stop
  end.


%% create transitions processes first, then send to them info about arcs
init_transitions(Transitions, Arcs) ->
  {ok, Pids} = transitions(Transitions, []),
  arcs(Arcs, Pids),
  Pids.
  
transitions([], Pids) ->
  {ok, Pids};
transitions([Attributes | List], Pids) ->
  Pid = transition:init(Attributes),
  transitions(List, [Pid | Pids]).

arcs([], Pids) ->
  lists:foreach(fun ({_Id, Pid, _Priority}) -> Pid ! ready end, Pids),
  ok;
arcs([H | Arcs], Pids) ->
  [{<<"id">>, _Id} | [{<<"fromType">>, From_type} | [{<<"name">>, _N} | [{<<"fromId">>, From_id} | [{<<"toId">>, To_id} | [{<<"weight">>, W} | _Rest]]]]]] = H,
  case From_type of
    <<"transition">> ->
      %io:format("FromId:~p~nPids:~p~n", [From_id, Pids]),
      {_Tr_id, Pid, _Priority} = lists:keyfind(From_id, 1, Pids),
      Pid ! {from, To_id, W};
    <<"place">> ->
      %io:format("FromId:~p~nPids:~p~n", [From_id, Pids]),
      {_Tr_id, Pid, _Priority} = lists:keyfind(To_id, 1, Pids),
      Pid ! {to, From_id, W}
    %TODO: remove this after debugging
    %Other ->
    %  io:format("what? ~p~nwhat?~n", [Other])
  end,
  arcs(Arcs, Pids).

  
% splits list of net elements to three lists:
% - Places
% - Transitions
% - Arcs
group_elements(List) ->
  group_elements([], [], [], List).

group_elements(Places, Transitions, Arcs, []) ->
  {ok, Places, Transitions, Arcs};
group_elements(Places, Transitions, Arcs, [{struct, Attributes} | List]) ->
  %io:format("TT~pTT~nSS~pSS~n", [Attributes, List]),
  case Attributes of
    [] ->
      group_elements(Places, Transitions, Arcs, List);
    [Type | Attr] ->
      case Type of
        {<<"element">>, <<"place">>} ->
          group_elements([Attr | Places], Transitions, Arcs, List);
        {<<"element">>, <<"transition">>} ->
          group_elements(Places, [Attr | Transitions], Arcs, List);
        {<<"element">>, <<"arc">>} ->
          group_elements(Places, Transitions, [Attr | Arcs], List)
        %TODO: remove this after debugging
        %Other ->
        %  io:format("group_elements error: ~p~n", [Other]),
        %  {ok, [], [], []}
      end
  end.


%%% interface

play() ->
  simulation ! play.

pause() ->
  simulation ! pause.

stop() ->
  simulation ! stop.

