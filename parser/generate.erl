-module(generate).
-export([to_file/1]).


to_file(Data) ->
  Text = wf:f("~p~n", [Data]),
  io:format("~p~n", [Data]),
  Res = mochijson2:decode(Data),
  
  case file:make_dir("./site/tmp/") of
    ok -> ok;
    {error, eexist} -> ok
  end,
  ok = file:set_cwd("./site/tmp/"),
  {ok, Device} = file:open("result", write),  
  
  io:format(Text),
  petricode:print(Device, Res),
  file:close(Device),
  
  {ok, Dir} = file:get_cwd(),
  Ref = io_lib:format("file://~s/result", [Dir]),
  io:format("'~s'",[Ref]),
  wf:insert_bottom(menu_items, "<a href=\"result\">Wygenerowany plik</a>" ),%Ref }),
  ok = file:set_cwd("../../").

