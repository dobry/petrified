-module(logger).
-export([init/0]).
-export([loop/1]).
-export([log/1, get_log/0]).

init() ->
  case is_registered() of
    true ->
      {error, "logger already exist"};
    false ->
      register(logger, spawn(logger, loop, []))
  end.

%% mail loop of logger process
loop(Messages) ->
  receive
    {msg, Msg} ->
      loop([Msg | Messages]);
    {get_log, Pid} ->
      Pid ! Messages,
      loop([]);
    Any ->
      io:format("logger: wrong message: ~w~n", [Any])
  end.

log(Msg) ->
  send({msg, Msg}),
  receive
    ok -> ok
  end.

get_log() ->
  send({get_log, self()}),
  receive
    {log, Log} -> Log
  end.

send(Message) ->
  logger ! Message.

%%% interface helpers
%% checks if process is present
is_registered() ->
  Registered = registered(),
  lists:any(fun(Elem) -> Elem == logger end, Registered). 
