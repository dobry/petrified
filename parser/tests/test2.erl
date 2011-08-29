-module(test2).
-export([parser/0]).

parser() ->
  parser:parse(scanner:tokenize("source")).
