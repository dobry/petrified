-module(scanner).
-export([tokenize/1]).

tokenize(File) ->
  reader:init(File),
  Tok_List = lists:reverse(in_source([], [], 1)),
  reader:close(),
  Tok_List.
  
in_source([], Tok_List, Line) ->
%  Symbol = reader:next(),
%  io:format("~c~n", [Symbol]),
%  case Symbol of
  case reader:next() of
    $# -> in_comment([], Tok_List, Line);
    White when (White == $ ) or (White == $\t) -> in_white([], Tok_List, Line);
    $\n -> in_source([], Tok_List, Line + 1);
    Char when ((Char >= $a) and (Char =< $z)) or ((Char >= $A) and (Char =< $Z)) or (Char == $_) -> in_ident([Char], Tok_List, Line);
    $0 -> in_zero([$0], Tok_List, Line);
    Num when (Num >= $1) and (Num =< $9) -> in_number([Num], Tok_List, Line);
    eof -> [{'$end', Line} | Tok_List]
  end.

in_comment([], Tok_List, Line) ->
%  Symbol = reader:next(),
%  io:format("~c~n", [Symbol]),
%  case Symbol of
  case reader:next() of
    $\n -> in_source([], Tok_List, Line + 1);
    eof -> [{'$end', Line} | Tok_List];
    _Char -> in_comment([], Tok_List, Line)
  end.
    
in_ident(String, Tok_List, Line) ->
%  Symbol = reader:next(),
%  io:format("~c~n", [Symbol]),
%  case Symbol of
  case reader:next() of
    Char when ((Char >= $a) and (Char =< $z)) or ((Char >= $A) and (Char =< $Z)) or 
              ((Char >= $0) and (Char =< $9)) or (Char == $_) 
              -> in_ident([Char | String], Tok_List, Line);
    $\n -> in_source([], [{ident, Line, String} | Tok_List], Line + 1);
    White when (White == $ ) or (White == $\t) -> in_white([], [{ident, Line, String} | Tok_List], Line);
    $# -> in_comment([], [{ident, Line, String} | Tok_List], Line);
    eof -> [{'$end', Line} | [{ident, Line, String} | Tok_List]]
  end.
  
in_white([], Tok_List, Line) ->
%  Symbol = reader:next(),
%  io:format("~c~n", [Symbol]),
%  case Symbol of
  case reader:next() of
    $# -> in_comment([], Tok_List, Line);
    White when (White == $ ) or (White == $\t) -> in_white([], Tok_List, Line);
    $\n -> in_source([], Tok_List, Line + 1);
    Char when ((Char >= $a) and (Char =< $z)) or ((Char >= $A) and (Char =< $Z)) or (Char == $_) -> in_ident([Char], Tok_List, Line);
    $0 -> in_zero([$0], Tok_List, Line);
    Num when (Num >= $1) and (Num =< $9) -> in_number([Num], Tok_List, Line);
    eof -> [{'$end', Line} | Tok_List]
  end.
  
in_zero($0, Tok_List, Line) ->
%  Symbol = reader:next(),
%  io:format("~c~n", [Symbol]),
%  case Symbol of
  case reader:next() of
    $# -> in_comment([], [{num, Line, 0} | Tok_List], Line);
    $\n -> in_source([], [{num, Line, 0} | Tok_List], Line + 1);
    White when (White == $ ) or (White == $\t) -> in_white([], [{num, Line, 0} | Tok_List], Line);
    $. -> in_dot([$., $0], Tok_List, Line);
    eof -> [{'$end', Line} | [{num, Line, 0} | Tok_List]]
  end.
  
in_number(String, Tok_List, Line) ->
%  Symbol = reader:next(),
%  io:format("~c~n", [Symbol]),
%  case Symbol of
  case reader:next() of
    $\n -> in_source([], [{num, Line, reverse_to_integer(String)} | Tok_List], Line + 1);
    Num when (Num >= $0) and (Num =< $9) -> in_number([Num | String], Tok_List, Line);
    White when (White == $ ) or (White == $\t) -> in_white([], [{num, Line, reverse_to_integer(String)} | Tok_List], Line);
    $. -> in_dot([$. | [String]], Tok_List, Line);
    $# -> in_comment([], [{num, Line, reverse_to_integer(String)} | Tok_List], Line);
    eof ->
      [{'$end', Line} | [{num, Line, reverse_to_integer(String)} | Tok_List]]
  end.

in_dot(String, Tok_List, Line) ->
%  Symbol = reader:next(),
%  io:format("~c~n", [Symbol]),
%  case Symbol of
  case reader:next() of
    Num when (Num >= $0) and (Num =< $9) -> in_float([Num | String], Tok_List, Line)
  end.

in_float(String, Tok_List, Line) ->
%  Symbol = reader:next(),
%  io:format("~c~n", [Symbol]),
%  case Symbol of
  case reader:next() of
    $# -> in_comment([], [{flo, Line, reverse_to_float(String)} | Tok_List], Line);
    $\n -> in_source([], [{flo, Line, reverse_to_float(String)} | Tok_List], Line + 1);
    Num when (Num >= $0) and (Num =< $9) -> in_float([Num | String], Tok_List, Line);
    White when (White == $ ) or (White == $\t) -> in_white([], [{num, Line, reverse_to_float(String)} | Tok_List], Line);
    eof -> [{'$end', Line} | [{flo, Line, reverse_to_float(String)} | Tok_List]]
  end.

reverse_to_float(String) ->
  {Value, []} = string:to_float(lists:reverse(String)),
  Value.

reverse_to_integer(String) ->
  {Value, []} = string:to_integer(lists:reverse(String)),
  Value.
