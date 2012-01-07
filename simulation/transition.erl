-module(transition).
-export([init/1, init_arcs/1]).
-include("net_records.hrl").

init(Attrs) ->
  %io:format("Transition lauched:~p~n", [Attrs]),
  [{<<"id">>, Id} | [{<<"name">>, Name} | [{<<"x">>, Left} | [{<<"y">>, Top} | [{<<"delay">>, Delay} | [_Angle]]]]]] = Attrs,
  Tr = #transition {
    id = Id,
    name = Name,
    left = Left,
    top = Top,
    delay = Delay
  },
  {Id, spawn(transition, init_arcs, [Tr])}.

init_arcs(Tr) ->
  %io:format("Transition lauched:~p~n", [Tr]),
  receive
    {from, To, W} ->
      New_tr = Tr#transition{arcs_from = [{To, W} | Tr#transition.arcs_from]},
      init_arcs(New_tr);
    {to, From, W} ->
      New_tr = Tr#transition{arcs_to = [{From, W} | Tr#transition.arcs_to]},
      init_arcs(New_tr);
    ready ->
      loop(Tr)
  end.

loop(Tr) ->
  io:format("Transition lauched:~p~n", [Tr]),
  ok.
