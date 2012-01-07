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
  spawn(transition, init_arcs, [Tr]).

init_arcs(Tr) ->
  io:format("Transition lauched:~p~n", [Tr]),
  ok.

loop(_Transition) ->
  ok.
