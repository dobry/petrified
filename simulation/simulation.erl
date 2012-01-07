-module(simulation).
-export([init/1, group_elements/1]).
-include("net_records.hrl").

init(List) ->
  Res = group_elements(List),
  io:format("~p\n", [Res]).

% splits list of net elements to three lists:
% - Places
% - Transitions
% - Arcs
group_elements(List) ->
  group_elements([], [], [], List).

group_elements(Places, Transitions, Arcs, []) ->
  {ok, Places, Transitions, Arcs};
group_elements(Places, Transitions, Arcs, [{struct, Attributes} | List]) ->
  case Attributes of
    [] ->
      group_elements(Places, Transitions, Arcs, List);
    [Type | Attr] ->
      case Type of
        {"element","place"} ->
          group_elements([Attr | Places], Transitions, Arcs, List);
        {"element","transition"} ->
          group_elements(Places, [Attr | Transitions], Arcs, List);
        {"element","arc"} ->
          group_elements(Places, Transitions, [Attr | Arcs], List)
      end
  end.
