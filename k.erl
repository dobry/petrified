-module(k).
-export([a/0, all/0, parser/0, k/0, start/0, reload/1]).

a() ->
  io:format("compile: ~w~n", [compile:file("scanner/reader.erl")]),
  io:format("compile: ~w~n", [compile:file("scanner/scanner.erl")]),
  io:format("generate parser: ~w~n", [yecc:file("parser/parser.yrl")]),
  io:format("compile: ~w~n", [compile:file("parser/parser.erl")]),
  io:format("compile: ~w~n", [compile:file("tests/test1.erl")]),
  io:format("compile: ~w~n", [compile:file("tests/test2.erl")]).

all() ->
  parser(),
  k().
  
parser() ->
  yecc:file("parser/parser.yrl"),
  make:files(["parser/parser.erl"]),
  code:purge(parser),
  %code:load_file(parser),
  io:format("loading: ~w~n", [code:load_file(parser)]).


k() ->
  io:format("~w~n", [make:all()]),%([debug_info]),
  % modules to (re)load
  Modules = [reader, scanner, test1, test2],
  reload(Modules).

reload([]) ->
  ok;
reload([Module | Rest]) ->
  code:purge(Module),
  %code:load_file(Module),
  io:format("loading: ~w~n", [code:load_file(Module)]),
  reload(Rest).

start() ->
  pman:start().

