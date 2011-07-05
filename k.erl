-module(k).
-export([all/0, parser/0, k/0, start/0, reload/1]).

all() ->
  parser(),
  k().
  
parser() ->
  yecc:file("parser/parser.yrl"),
  make:files(["parser/parser.erl"]).

k() ->
  io:format("~w~n", [make:all()]),%([debug_info]),
  % modules to (re)load
  Modules = [reader, scanner, test1, test2],
  reload(Modules).

reload([]) ->
  ok;
reload([Module | Rest]) ->
  code:purge(Module),
  io:format("loading: ~w~n", [code:load_file(Module)]),
  reload(Rest).

start() ->
  pman:start().

