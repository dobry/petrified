-module(scanner2).
-export([tokenize/1]).

%%% interface

tokenize(File) ->
  case reader:init(File) of
    ok ->
      Tok_List = lists:reverse(in_source([], [], 1)),
      reader:close(),
      Tok_List;
    {error, Reason} ->
      {error, Reason}
  end.   
  


%%% state functions

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
    eof -> [{'$end', Line} | Tok_List];
    Any -> 
      Reason = io_lib:format("Wrong char '~c'", [Any]),
      {error, Line, Reason}
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
    $\n -> in_source([], [is_keyword(String, Line) | Tok_List], Line + 1);
    White when (White == $ ) or (White == $\t) -> in_white([], [is_keyword(String, Line) | Tok_List], Line);
    $# -> in_comment([], [is_keyword(String, Line) | Tok_List], Line);
    eof -> [{'$end', Line} | [is_keyword(String, Line) | Tok_List]];
    Any -> 
      Reason = io_lib:format("Expected indetificator but found forbidden char '~c'", [Any]),      
      {error, Line, Reason}
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
    $0 -> in_zero($0, Tok_List, Line);
    Num when (Num >= $1) and (Num =< $9) -> in_number([Num], Tok_List, Line);
    eof -> [{'$end', Line} | Tok_List];
    Any ->  
      Reason = io_lib:format("Wrong char '~c'", [Any]),      
      {error, Line, Reason}
  end.
  
in_zero($0, Tok_List, Line) ->
%  Symbol = reader:next(),
%  io:format("~c~n", [Symbol]),
%  case Symbol of
  case reader:next() of
    $# -> in_comment([], [{'integer', Line, 0} | Tok_List], Line);
    $\n -> in_source([], [{'integer', Line, 0} | Tok_List], Line + 1);
    White when (White == $ ) or (White == $\t) -> in_white([], [{'integer', Line, 0} | Tok_List], Line);
    $. -> in_dot([$., $0], Tok_List, Line);
    eof -> [{'$end', Line} | [{'integer', Line, 0} | Tok_List]];
    Any ->  
      Reason = io_lib:format("Expected number but found wrong char '~c'", [Any]),      
      {error, Line, Reason}
  end.

in_number(String, Tok_List, Line) ->
%  Symbol = reader:next(),
%  io:format("~c~n", [Symbol]),
%  case Symbol of
  case reader:next() of
    $\n -> in_source([], [{'integer', Line, reverse_to_integer(String)} | Tok_List], Line + 1);
    Num when (Num >= $0) and (Num =< $9) -> in_number([Num | String], Tok_List, Line);
    White when (White == $ ) or (White == $\t) -> in_white([], [{'integer', Line, reverse_to_integer(String)} | Tok_List], Line);
    $. -> in_dot([$. | String], Tok_List, Line);
    $# -> in_comment([], [{'integer', Line, reverse_to_integer(String)} | Tok_List], Line);
    eof -> [{'$end', Line} | [{'integer', Line, reverse_to_integer(String)} | Tok_List]];
    Any ->  
      Reason = io_lib:format("Expected number but found wrong char '~c'", [Any]),      
      {error, Line, Reason}
  end.

in_dot(String, Tok_List, Line) ->
%  Symbol = reader:next(),
%  io:format("~c~n", [Symbol]),
%  case Symbol of
  case reader:next() of
    Num when (Num >= $0) and (Num =< $9) -> in_float([Num | String], Tok_List, Line);
    Any ->   
      Reason = io_lib:format("Expected number but found wrong char '~c'", [Any]),      
      {error, Line, Reason}
  end.

in_float(String, Tok_List, Line) ->
%  Symbol = reader:next(),
%  io:format("~c~n", [Symbol]),
%  case Symbol of
  case reader:next() of
    $# -> in_comment([], [{'float', Line, reverse_to_float(String)} | Tok_List], Line);
    $\n -> in_source([], [{'float', Line, reverse_to_float(String)} | Tok_List], Line + 1);
    Num when (Num >= $0) and (Num =< $9) -> in_float([Num | String], Tok_List, Line);
    White when (White == $ ) or (White == $\t) -> in_white([], [{'float', Line, reverse_to_float(String)} | Tok_List], Line);
    eof -> [{'$end', Line} | [{'float', Line, reverse_to_float(String)} | Tok_List]];
    Any ->  
      Reason = io_lib:format("Expected float but found wrong char '~c'", [Any]),      
      {error, Line, Reason}
  end.


%%% helpers

reverse_to_float(String) ->
  {Value, []} = string:to_float(lists:reverse(String)),
  Value.

reverse_to_integer(String) ->
  {Value, []} = string:to_integer(lists:reverse(String)),
  Value.

%% if given string is one of the keywords, is_keyword() return special token, if not, it returns standard {identifier, Line, Value} tuple
is_keyword(String, Line) ->
  keyword(lists:reverse(String), Line).

keyword("end", Line) ->
  {end_tok, Line};
keyword("place", Line) ->
  {place_tok, Line};
keyword("transition", Line) ->
  {transition_tok, Line};
keyword("arc", Line) ->
  {arc_tok, Line};
keyword("settings", Line) ->
  {settings_tok, Line};
keyword(String, Line) ->
  {identifier, Line, String}.
