-module(reader).
-export([loop/3]).
-export([init/0, init/1]).
-export([filename/0, open/1, close/0, next/0]).

%%% inner functions

%% init: starts reader process, optional argument is name of a file to read from
init() ->
  case is_registered() of
    true ->
      {error, "reader already exist"};
    false ->
      register(reader, spawn(reader, loop, [[], [], none]))
  end.
  
init(File) ->
	init(),
	reader:open(File).

%% mail loop of reader process
loop(Line, Device, Filename) ->
  receive
    {open, File, Pid} ->
      open_file(File, Pid);
    {get_char, Pid} ->
      {ok, C, New_Line} = get_char(Line, Device),
      Pid ! {character, C},
      loop(New_Line, Device, Filename);
    {close_file, Pid} ->
      Pid ! file:close(Device);
    {get_filename, Pid} ->
      Pid ! {filename, Filename},
      loop(Line, Device, Filename);
    Any ->
      io:format("reader: wrong message command: ~w~n", [Any])
  end.

%% returns next character, fetches new line if needed
get_char([], Device) ->
  Line = io:get_line(Device, ""),
  get_char(Line, Device);
get_char(eof, _Device) ->
  {ok, eof, []};
get_char(Line, _Device) ->
  [H | Tail] = Line,
  {ok, H, Tail}.

open_file(File, Pid) ->
  case  file:open(File, [read]) of
    {error, Reason} ->
      io:format("~w~n", [Reason]),
      Pid ! {error, Reason};
    {ok, Device} ->   
      Pid ! ok,       
      loop([], Device, File)
  end.  

%%% interface

open(File) ->
  send({open, File, self()}),
  receive
    Msg -> Msg
  end.

close() ->
  send({close_file, self()}),
  receive
    Msg -> Msg
  end.

next() ->
  send({get_char, self()}),
  receive
    {character, C} ->
      C;
    {error, Msg} ->
      io:format("~p~n", [Msg]),
      error
  end.

filename() ->
  send({get_filename, self()}),
  receive
    {filename, Filename} -> Filename
  end.
  
%%% interface helpers
%% checks if reader process is present
is_registered() ->
  Registered = registered(),
  lists:any(fun(Elem) -> Elem == reader end, Registered).  

send(Message) ->
  reader ! Message.
