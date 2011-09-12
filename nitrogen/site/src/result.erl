-module(result).
-compile(export_all).
-include_lib("nitrogen/include/wf.hrl").
-include("records.hrl").

main() -> #template { file = "./site/templates/result.html" }.

title() -> "Petri Nets".

body() -> 
  {ok, Dir} = file:get_cwd(), 
  io:format("~s~n", [Dir]),
  case file:open("site/tmp/result", read) of
    {ok, Device} ->   loop(Device, []);
    {error, Reason} -> io:format("~s", [Reason])
  end.


loop(Device, Body) ->
  case file:read_line(Device) of
    eof -> Body;
    {ok, Data} -> 
      io:fwrite("~s", [Data]),
      loop(Device, [Data | Body])
  end.
