-module(transition).
-export([init/1, loop/1]).
-include("net_records.hrl").

init(Transition) ->
  io:format("Transition lauched:~p~n", [Transition]),
  ok.

loop(_Transition) ->
  ok.
