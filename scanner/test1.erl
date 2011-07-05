-module(test1).
-export([reader/0, scanner/0]).
  
reader() ->
  io:format("Testing reader module:~n", []),
  io:format("~w~n", [reader:init("test1.source")]),
  reader_loop(),
  io:format("Testing reader finished.~n", []).

reader_loop() ->
  case reader:next() of
    eof ->
      io:format("~w~n", [reader:close()]);
    C ->
      io:format("~c~n", [C]),
      reader_loop()
  end.

print([]) ->
  ok;
print([Tok | List]) ->
  io:format("~w~n", [Tok]),
  print(List).  

scanner() ->
  io:format("Testing scanner module:~n", []),
  print(scanner:tokenize("test1.source")),
  io:format("Testing scanner finished.~n", []).
