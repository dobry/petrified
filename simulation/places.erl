-module(places).
-export([init/1]).
-include("net_records.hrl").

init(Places_List) ->
  %Dict = create_dict(Elements_List),
  %register(places, spawn(places, loop, [Dict])).
  ok.

loop(_Dict) ->
  ok.

create_dict(Elements_List) ->
  ok.
  %dict:new(),
  %lists:map()
  %Places = Dict,

