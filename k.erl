-module(k).
-export([k/0, start/0]).

k() ->
  % modules to compile and (re)load
  Modules = [reader, scanner, test1],
  make:all(),%([debug_info]),
  compile_and_reload(Modules).

compile_and_reload([]) ->
  ok;
compile_and_reload([Module | Rest]) ->
  code:purge(Module),
  code:load_file(Module),
  compile_and_reload(Rest).

start() ->
  pman:start().

